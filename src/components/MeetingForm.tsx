import React, { useEffect, useMemo, useState } from 'react';
import { X, Calendar, Clock, Users, MapPin, Video } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import ModernCard from './ModernCard';
import ModernButton from './ModernButton';

interface MeetingFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedDate?: string;
  meeting?: {
    id: string;
    title: string;
    description?: string;
    start_time: string;
    end_time: string;
    date: string;
    attendees?: string[];
    location?: string;
    meeting_type: string;
    priority: string;
  } | null;
}

const MeetingForm: React.FC<MeetingFormProps> = ({ isOpen, onClose, onSuccess, selectedDate, meeting }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const emptyForm = useMemo(() => ({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    date: selectedDate || '',
    attendees: [] as string[],
    location: '',
    meeting_type: 'in_person',
    priority: 'medium'
  }), [selectedDate]);

  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    if (!isOpen) return;
    setCurrentStep(1);

    if (meeting) {
      setFormData({
        title: meeting.title || '',
        description: meeting.description || '',
        start_time: meeting.start_time || '',
        end_time: meeting.end_time || '',
        date: meeting.date || selectedDate || '',
        attendees: meeting.attendees || [],
        location: meeting.location || '',
        meeting_type: meeting.meeting_type || 'in_person',
        priority: meeting.priority || 'medium'
      });
    } else {
      setFormData(emptyForm);
    }
  }, [isOpen, meeting, emptyForm]);

  const meetingTypes = [
    { value: 'in_person', label: 'In Person' },
    { value: 'video_call', label: 'Video Call' },
    { value: 'phone_call', label: 'Phone Call' },
    { value: 'hybrid', label: 'Hybrid' }
  ];

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }
  ];

  // === Style matching ProfilePageNew ===
  const baseField =
    'w-full px-3 py-2 bg-[#35414e] border border-[#1e2938] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9c68f2]';

  const labelCls = 'block text-sm font-medium text-gray-300 mb-2';

  const handleAttendeesChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
      e.preventDefault();
      const newAttendee = e.currentTarget.value.trim();
      if (!formData.attendees.includes(newAttendee)) {
        setFormData({
          ...formData,
          attendees: [...formData.attendees, newAttendee]
        });
      }
      e.currentTarget.value = '';
    }
  };

  const removeAttendee = (attendeeToRemove: string) => {
    setFormData({
      ...formData,
      attendees: formData.attendees.filter(attendee => attendee !== attendeeToRemove)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSupabaseConfigured || !supabase) {
      toast.error('Database not configured');
      return;
    }

    if (!formData.title.trim()) {
      toast.error('Meeting title is required');
      return;
    }

    if (!formData.start_time || !formData.end_time) {
      toast.error('Start and end times are required');
      return;
    }

    setLoading(true);
    const toastId = toast.loading(meeting ? 'Updating meeting...' : 'Creating meeting...');

    try {
      const meetingData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        start_time: formData.start_time,
        end_time: formData.end_time,
        date: formData.date,
        attendees: formData.attendees.length > 0 ? formData.attendees : null,
        location: formData.location.trim() || null,
        meeting_type: formData.meeting_type,
        priority: formData.priority
      };

      if (meeting) {
        const { error } = await supabase
          .from('meetings')
          .update(meetingData)
          .eq('id', meeting.id);

        if (error) throw error;
        toast.success('Meeting updated successfully!', { id: toastId });
      } else {
        const { data, error } = await supabase
          .from('meetings')
          .insert([{ ...meetingData, user_id: user!.id }])
          .select('id')
          .single();

        if (error) throw error;
        toast.success('Meeting created successfully!', { id: toastId });
      }

      onSuccess();
      onClose();
      setCurrentStep(1);
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred. Please try again.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => currentStep < 2 && setCurrentStep(s => s + 1);
  const prevStep = () => currentStep > 1 && setCurrentStep(s => s - 1);

  if (!isOpen) return null;

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-white">
              <Calendar className="mr-2 text-[#9c68f2]" size={20} />
              Meeting Details
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Fields marked with <span className="text-red-400">*</span> are required.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>
                  Meeting Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={baseField}
                  placeholder="Client meeting"
                  required
                />
              </div>

              <div>
                <label className={labelCls}>Meeting Type</label>
                <select
                  value={formData.meeting_type}
                  onChange={(e) => setFormData({ ...formData, meeting_type: e.target.value })}
                  className={baseField}
                >
                  {meetingTypes.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>
                  Date <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className={baseField}
                  required
                />
              </div>

              <div>
                <label className={labelCls}>Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className={baseField}
                >
                  {priorities.map((priority) => (
                    <option key={priority.value} value={priority.value}>{priority.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelCls}>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={baseField}
                rows={3}
                placeholder="Meeting agenda, topics to discuss, etc."
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-white">
              <Clock className="mr-2 text-[#9c68f2]" size={20} />
              Time & Location
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Set the meeting time and location details.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>
                  Start Time <span className="text-red-400">*</span>
                </label>
                <input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  className={baseField}
                  required
                />
              </div>

              <div>
                <label className={labelCls}>
                  End Time <span className="text-red-400">*</span>
                </label>
                <input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  className={baseField}
                  required
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className={baseField}
                placeholder="Office, Zoom link, or physical address"
              />
            </div>

            <div>
              <label className={labelCls}>Attendees</label>
              <input
                type="text"
                onKeyDown={handleAttendeesChange}
                className={baseField}
                placeholder="Type attendee email and press Enter"
              />
              {formData.attendees.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.attendees.map((attendee, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-gradient-to-r from-[#9c68f2]/20 to-[#422ca5]/20 text-[#9c68f2] ring-1 ring-[#9c68f2]/30"
                    >
                      {attendee}
                      <button
                        type="button"
                        onClick={() => removeAttendee(attendee)}
                        className="ml-1 text-[#9c68f2] hover:text-white"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose}>
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <ModernCard>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {meeting ? 'Edit Meeting' : 'New Meeting'}
                </h2>
                <div className="flex items-center mt-4 space-x-3">
                  {[
                    { step: 1, label: 'Details', icon: Calendar },
                    { step: 2, label: 'Time & Location', icon: Clock }
                  ].map(({ step, label, icon: Icon }) => (
                    <div key={step} className="flex items-center">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${
                        step <= currentStep 
                          ? 'bg-gradient-to-r from-[#9c68f2] to-[#422ca5] border-[#9c68f2] text-white' 
                          : 'bg-[#35414e] border-gray-600 text-gray-400'
                      }`}>
                        <Icon size={16} />
                      </div>
                      <div className="ml-2 hidden sm:block">
                        <div className={`text-xs font-medium ${
                          step <= currentStep ? 'text-white' : 'text-gray-400'
                        }`}>
                          {label}
                        </div>
                        <div className={`text-xs ${
                          step <= currentStep ? 'text-[#9c68f2]' : 'text-gray-500'
                        }`}>
                          Step {step}
                        </div>
                      </div>
                      {step < 2 && (
                        <div className={`ml-3 w-8 h-0.5 transition-all ${
                          step < currentStep ? 'bg-gradient-to-r from-[#9c68f2] to-[#422ca5]' : 'bg-gray-600'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-[#35414e] rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-xs text-gray-400 mb-2">
                <span>Progress</span>
                <span>{currentStep}/2</span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-[#9c68f2] to-[#422ca5] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / 2) * 100}%` }}
                />
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {renderStep()}

              {/* Footer */}
              <div className="flex justify-between mt-8 pt-6 border-t border-[#35414e]">
                <ModernButton
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  variant="outline"
                >
                  Previous
                </ModernButton>

                <div className="flex space-x-3">
                  <ModernButton
                    type="button"
                    onClick={onClose}
                    variant="outline"
                    disabled={loading}
                  >
                    Cancel
                  </ModernButton>

                  {currentStep < 2 ? (
                    <ModernButton
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        nextStep();
                      }}
                    >
                      Next
                    </ModernButton>
                  ) : (
                    <ModernButton
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? 'Processing...' : (meeting ? 'Update' : 'Create')}
                    </ModernButton>
                  )}
                </div>
              </div>
            </form>
          </ModernCard>
        </div>
      </div>
    </div>
  );
};

export default MeetingForm;
