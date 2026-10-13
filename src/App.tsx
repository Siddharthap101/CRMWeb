import React from 'react';
import { CRMProvider, useCRM } from './context/CRMContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { DashboardView } from './components/dashboard/DashboardView';
import { LeadTableView } from './components/leads/LeadTableView';
import { FollowUpsView } from './components/followups/FollowUpsView';
import { QuotationRequiredView } from './components/quotations/QuotationRequiredView';
import { QuotationsListView } from './components/quotations/QuotationsListView';
import { AttachmentsView } from './components/attachments/AttachmentsView';
import { PortfolioView } from './components/portfolio/PortfolioView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';

// Modals
import { AddLeadModal } from './components/leads/AddLeadModal';
import { RecordResponseModal } from './components/leads/RecordResponseModal';
import { LeadDetailModal } from './components/leads/LeadDetailModal';
import { ExcelImportModal } from './components/leads/ExcelImportModal';
import { QuotationBuilderModal } from './components/quotations/QuotationBuilderModal';
import { QuotationPreviewModal } from './components/quotations/QuotationPreviewModal';
import { WhatsAppShareModal } from './components/quotations/WhatsAppShareModal';
import { FileUploadModal } from './components/attachments/FileUploadModal';
import { ShareDetailsModal } from './components/portfolio/ShareDetailsModal';
import { ToastContainer } from './components/common/Toast';

const AppContent: React.FC = () => {
  const { currentView, isSidebarOpen } = useCRM();

  const renderActiveView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'all_leads':
        return <LeadTableView filterType="all" />;
      case 'my_leads':
        return <LeadTableView filterType="my" />;
      case 'todays_followups':
        return <FollowUpsView />;
      case 'callback_required':
        return <LeadTableView filterType="callback" />;
      case 'quotation_required':
        return <QuotationRequiredView />;
      case 'quotations':
        return <QuotationsListView />;
      case 'interested':
        return <LeadTableView filterType="interested" />;
      case 'won_deals':
        return <LeadTableView filterType="won" />;
      case 'lost_leads':
        return <LeadTableView filterType="lost" />;
      case 'reports':
        return <ReportsView />;
      case 'attachments':
        return <AttachmentsView />;
      case 'portfolio':
        return <PortfolioView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* 13-Section CRM Sidebar */}
      <Sidebar />

      {/* Main Workspace Frame */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'pl-64' : 'pl-20'
        }`}
      >
        {/* Top Header */}
        <TopBar />

        {/* Viewport Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Modals */}
      <AddLeadModal />
      <RecordResponseModal />
      <LeadDetailModal />
      <ExcelImportModal />
      <QuotationBuilderModal />
      <QuotationPreviewModal />
      <WhatsAppShareModal />
      <FileUploadModal />
      <ShareDetailsModal />

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <CRMProvider>
      <AppContent />
    </CRMProvider>
  );
}
