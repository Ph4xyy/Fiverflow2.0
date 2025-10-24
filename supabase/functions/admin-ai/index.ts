import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AIRequest {
  prompt: string
  context?: string
}

interface AIResponse {
  summary: string
  insights: string[]
  recommendations: string[]
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      'https://your-project.supabase.co', // Remplacez par votre URL Supabase
      'your_supabase_anon_key', // Remplacez par votre clé anon
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the current user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user is admin or moderator
    const { data: profile, error: profileError } = await supabaseClient
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile || !['admin', 'moderator'].includes(profile.role)) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin or moderator role required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const method = req.method

    // POST /admin-ai - Generate AI insights
    if (method === 'POST') {
      const { prompt, context }: AIRequest = await req.json()

      if (!prompt) {
        return new Response(
          JSON.stringify({ error: 'Prompt is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Get recent data for context
      const { data: stats } = await supabaseClient.rpc('get_admin_stats')
      
      // Get recent transactions
      const { data: recentTransactions } = await supabaseClient
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      // Get recent user activity
      const { data: recentUsers } = await supabaseClient
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

      // Prepare context data
      const contextData = {
        stats: stats || {},
        recentTransactions: recentTransactions || [],
        recentUsers: recentUsers || [],
        timestamp: new Date().toISOString()
      }

      // Call OpenAI API
      const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
      if (!openaiApiKey) {
        return new Response(
          JSON.stringify({ error: 'OpenAI API key not configured' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const systemPrompt = `Tu es un assistant IA spécialisé dans l'analyse de données business pour une plateforme SaaS. 
      
Tu as accès aux données suivantes:
- Statistiques générales: ${JSON.stringify(contextData.stats)}
- Transactions récentes: ${JSON.stringify(contextData.recentTransactions)}
- Utilisateurs récents: ${JSON.stringify(contextData.recentUsers)}

Réponds en français et fournis des insights actionables basés sur ces données.`

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`)
      }

      const aiResponse = await response.json()
      const aiContent = aiResponse.choices[0]?.message?.content || 'Aucune réponse générée'

      // Parse the AI response to extract insights and recommendations
      const insights = extractInsights(aiContent)
      const recommendations = extractRecommendations(aiContent)

      const result: AIResponse = {
        summary: aiContent,
        insights,
        recommendations
      }

      // Log the AI interaction
      await supabaseClient
        .from('admin_actions_log')
        .insert({
          admin_user_id: user.id,
          target_user_id: null,
          action_type: 'ai_assistant_query',
          payload: {
            prompt,
            response_length: aiContent.length,
            model: 'gpt-3.5-turbo'
          }
        })

      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in admin-ai function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function extractInsights(content: string): string[] {
  const insights: string[] = []
  
  // Look for bullet points or numbered lists
  const lines = content.split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.match(/^[-•*]\s/) || trimmed.match(/^\d+\.\s/)) {
      insights.push(trimmed.replace(/^[-•*\d\.\s]+/, ''))
    }
  }
  
  return insights.slice(0, 5) // Limit to 5 insights
}

function extractRecommendations(content: string): string[] {
  const recommendations: string[] = []
  
  // Look for recommendation keywords
  const lines = content.split('\n')
  for (const line of lines) {
    const trimmed = line.trim().toLowerCase()
    if (trimmed.includes('recommandation') || 
        trimmed.includes('suggestion') || 
        trimmed.includes('action') ||
        trimmed.includes('amélioration')) {
      recommendations.push(line.trim())
    }
  }
  
  return recommendations.slice(0, 3) // Limit to 3 recommendations
}
