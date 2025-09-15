import React from "react";

type State = { hasError: boolean; error?: any };

export default class AppErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: undefined };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, info: any) {
    console.error("[AppErrorBoundary]", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 16 }}>
          <div
            style={{
              border: "1px solid #ef4444",
              background: "rgba(239,68,68,0.08)",
              color: "#991b1b",
              borderRadius: 8,
              padding: 16,
              fontFamily: "ui-sans-serif, system-ui",
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Something broke while loading the app.</div>
            <div style={{ fontSize: 12, opacity: 0.8, whiteSpace: "pre-wrap" }}>
              {String(this.state.error || "")}
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
