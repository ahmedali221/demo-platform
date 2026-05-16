import React from 'react';
import { Translation } from 'react-i18next';

interface State { hasError: boolean }

export default class RemoteErrorBoundary extends React.Component<
  { children: React.ReactNode; moduleName?: string },
  State
> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Translation>
          {(t) => (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#F0F2F5]">
              <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center max-w-sm">
                <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <h2 className="text-base font-bold text-gray-900 mb-2">
                  {t('error.moduleUnavailable')}
                </h2>
                <p className="text-gray-400 text-sm mb-1">
                  {t('error.checkServer', { name: this.props.moduleName ?? 'mf-data-export' })}
                </p>
              </div>
            </div>
          )}
        </Translation>
      );
    }
    return this.props.children;
  }
}
