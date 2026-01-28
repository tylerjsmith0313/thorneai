import React, { useState } from 'react';
import { 
  ChevronDown, ChevronUp, LayoutDashboard, Search, Filter, MessageSquare, BookOpen, Calendar as CalendarIcon
} from 'lucide-react';
import { MOCK_DEALS, MOCK_CONTACTS, MOCK_CONVERSATIONS } from './constants.ts';
import Header from './components/Header.tsx';
import IncomeCard from './components/IncomeCard.tsx';
import IncomeBreakdown from './components/IncomeBreakdown.tsx';
import OpportunitiesCard from './components/OpportunitiesCard.tsx';
import OpportunitiesBreakdown from './components/OpportunitiesBreakdown.tsx';
import ContactsAddedCard from './components/ContactsAddedCard.tsx';
import ContactsAddedBreakdown from './components/ContactsAddedBreakdown.tsx';
import ActiveConversationsCard from './components/ActiveConversationsCard.tsx';
import ActiveConversationsBreakdown from './components/ActiveConversationsBreakdown.tsx';
import WitheringCard from './components/WitheringCard.tsx';
import WitheringBreakdown from './components/WitheringBreakdown.tsx';
import BreakUpsCard from './components/BreakUpsCard.tsx';
import BreakUpsBreakdown from './components/BreakUpsBreakdown.tsx';
import DeadDealsCard from './components/DeadDealsCard.tsx';
import DeadDealsBreakdown from './components/DeadDealsBreakdown.tsx';
import DatabaseCard from './components/DatabaseCard.tsx';
import DatabaseBreakdown from './components/DatabaseBreakdown.tsx';
import ControlCenter from './components/ControlCenter.tsx';
import AddContactWizard from './components/AddContactWizard.tsx';
import ContactFinder from './components/ContactFinder.tsx';
import RadarScan from './components/RadarScan.tsx';
import BulkUpload from './components/BulkUpload.tsx';
import Scanner from './components/Scanner.tsx';

// Atomic & Modular Imports
import BaseButton from './components/ui/BaseButton.tsx';
import ContactCard from './components/contacts/ContactCard.tsx';
import SectionHeader from './components/ui/SectionHeader.tsx';
import ContactSlideout from './components/contacts/slideout/ContactSlideout.tsx';
import CommandInterface from './components/ai/CommandInterface.tsx';
import NeuralLinkInterface from './components/ai/NeuralLinkInterface.tsx';
import CreativeSuite from './components/creative/CreativeSuite.tsx';
import AnalyticsSection from './components/analytics/AnalyticsSection.tsx';
import AcademySection from './components/academy/AcademySection.tsx';
import ConversationEngine from './components/ai/ConversationEngine.tsx';
import CalendarSection from './components/calendar/CalendarSection.tsx';

// Auth Components
import AuthFlow from './components/auth/AuthFlow.tsx';

type ModalType = 'income' | 'opportunities' | 'contacts-added' | 'active-conversations' | 'withering' | 'break-ups' | 'dead-deals' | 'database' | 'control-center' | 'add-contact' | 'contact-finder' | 'radar-scan' | 'bulk-upload' | 'scanner' | null;

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [isDashboardExpanded, setIsDashboardExpanded] = useState(true);
  const [activeSection, setActiveSection] = useState<'ai-command' | 'conversations' | 'calendar' | 'contacts' | 'academy' | 'creative' | 'analytics'>('ai-command');
  const [aiSubMode, setAiSubMode] = useState<'command' | 'link'>('command');
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [prefilledLeadData, setPrefilledLeadData] = useState<any>(null);

  if (!isAuthenticated) {
    return <AuthFlow onComplete={() => setIsAuthenticated(true)} />;
  }

  const handleLeadVerification = (lead: any) => {
    setPrefilledLeadData(lead);
    setActiveModal('add-contact');
  };

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'ai-command':
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            <SectionHeader 
              title="AI Command" 
              description="Direct conversation with Thorne Neural Core."
              actions={
                <div className="flex bg-slate-100/50 p-1 rounded-2xl border border-slate-200/50">
                  <button 
                    onClick={() => setAiSubMode('command')}
                    className={`px-5 py-2 rounded-xl text-[11px] font-bold transition-all ${aiSubMode === 'command' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    AI Command
                  </button>
                  <button 
                    onClick={() => setAiSubMode('link')}
                    className={`px-5 py-2 rounded-xl text-[11px] font-bold transition-all ${aiSubMode === 'link' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    Neural Link
                  </button>
                </div>
              }
            />
            <div className="min-h-[450px]">
              {aiSubMode === 'command' ? <CommandInterface /> : <NeuralLinkInterface />}
            </div>
          </div>
        );

      case 'conversations':
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
             <SectionHeader 
              title="Conversation Engine" 
              description="Multi-channel engagement hub with AI tactical assistance."
              icon={<MessageSquare size={20} />}
            />
            <ConversationEngine />
          </div>
        );

      case 'calendar':
        return <CalendarSection />;

      case 'contacts':
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            <SectionHeader 
              title="Verified Database" 
              description="Human-verified leads and engagement nodes."
              actions={
                <div className="flex gap-2">
                  <div className="relative hidden sm:block">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Search contacts..." className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                  </div>
                  <BaseButton variant="outline" size="xs" icon={<Filter size={14} />} />
                  <BaseButton variant="primary" size="xs" onClick={() => {
                    setPrefilledLeadData(null);
                    setActiveModal('add-contact');
                  }}>+ New Lead</BaseButton>
                </div>
              }
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {MOCK_CONTACTS.map(contact => (
                <ContactCard key={contact.id} contact={contact} onClick={(id) => setSelectedContactId(id)} />
              ))}
            </div>
          </div>
        );

      case 'creative': return <CreativeSuite />;
      case 'analytics': return <AnalyticsSection />;
      case 'academy': return <AcademySection />;

      default:
        return (
          <div className="text-center py-20 animate-in fade-in zoom-in duration-500">
             <div className="w-20 h-20 bg-slate-50 rounded-[28px] flex items-center justify-center mx-auto mb-4 text-slate-200 border border-slate-100">
                <LayoutDashboard size={40} />
             </div>
             <h3 className="text-xl font-bold text-slate-900 capitalize tracking-tight">{(activeSection as string).replace('-', ' ')} Module</h3>
             <p className="text-slate-500 text-sm max-w-sm mx-auto mt-2 leading-relaxed">This component is being provisioned.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
      <Header 
        onControlCenterClick={() => setActiveModal('control-center')} 
        onAddContactClick={() => {
          setPrefilledLeadData(null);
          setActiveModal('add-contact');
        }}
        onContactFinderClick={() => setActiveModal('contact-finder')}
        onRadarScanClick={() => setActiveModal('radar-scan')}
        onBulkUploadClick={() => setActiveModal('bulk-upload')}
        onScannerClick={() => setActiveModal('scanner')}
      />

      <main className="flex-1 p-4 md:p-8 space-y-10">
        <div className="max-w-7xl mx-auto space-y-10">
          
          <div className="flex items-center justify-between bg-white px-8 py-5 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-5">
              <div className="p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-100 text-white">
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none uppercase">Neural Feed</h2>
                <p className="text-[10px] font-extrabold text-slate-400 mt-2 uppercase tracking-[0.1em]">Live business diagnostics and conversion telemetry.</p>
              </div>
            </div>
            <button 
              onClick={() => setIsDashboardExpanded(!isDashboardExpanded)}
              className="p-3 hover:bg-slate-50 rounded-2xl text-slate-400 transition-all border border-slate-100 hover:text-indigo-600 hover:border-indigo-100 shadow-sm"
            >
              {isDashboardExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>

          {isDashboardExpanded && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-top-4 duration-500">
              <IncomeCard deals={MOCK_DEALS} onClick={() => setActiveModal('income')} />
              <OpportunitiesCard deals={MOCK_DEALS} onClick={() => setActiveModal('opportunities')} />
              <ContactsAddedCard contacts={MOCK_CONTACTS} onClick={() => setActiveModal('contacts-added')} />
              <ActiveConversationsCard conversations={MOCK_CONVERSATIONS} onClick={() => setActiveModal('active-conversations')} />
              <WitheringCard contacts={MOCK_CONTACTS} onClick={() => setActiveModal('withering')} />
              <BreakUpsCard contacts={MOCK_CONTACTS} onClick={() => setActiveModal('break-ups')} />
              <DeadDealsCard deals={MOCK_DEALS} onClick={() => setActiveModal('dead-deals')} />
              <DatabaseCard contacts={MOCK_CONTACTS} onClick={() => setActiveModal('database')} />
            </div>
          )}

          <div className="space-y-8">
            <div className="flex items-center gap-1.5 bg-slate-100/50 p-1.5 rounded-[24px] w-fit border border-slate-200/50 overflow-x-auto no-scrollbar max-w-full">
              {(['ai-command', 'conversations', 'calendar', 'contacts', 'academy', 'creative', 'analytics'] as const).map(section => (
                <button
                  key={section}
                  onClick={() => setActiveSection(section)}
                  className={`px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${
                    activeSection === section 
                    ? 'bg-white text-indigo-600 shadow-lg border border-slate-100 scale-[1.02]' 
                    : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  {section.replace('-', ' ')}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-[48px] border border-slate-100 p-10 shadow-sm min-h-[500px] relative overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-slate-100/50">
               {renderSectionContent()}
            </div>
          </div>
        </div>
      </main>

      {/* Modals & Slideouts */}
      {selectedContactId && <ContactSlideout contactId={selectedContactId} onClose={() => setSelectedContactId(null)} />}
      {activeModal === 'income' && <IncomeBreakdown deals={MOCK_DEALS} onClose={() => setActiveModal(null)} />}
      {activeModal === 'opportunities' && <OpportunitiesBreakdown deals={MOCK_DEALS} onClose={() => setActiveModal(null)} />}
      {activeModal === 'contacts-added' && <ContactsAddedBreakdown contacts={MOCK_CONTACTS} onClose={() => setActiveModal(null)} />}
      {activeModal === 'active-conversations' && <ActiveConversationsBreakdown conversations={MOCK_CONVERSATIONS} onClose={() => setActiveModal(null)} />}
      {activeModal === 'withering' && <WitheringBreakdown contacts={MOCK_CONTACTS} onClose={() => setActiveModal(null)} />}
      {activeModal === 'break-ups' && <BreakUpsBreakdown contacts={MOCK_CONTACTS} onClose={() => setActiveModal(null)} />}
      {activeModal === 'dead-deals' && <DeadDealsBreakdown deals={MOCK_DEALS} onClose={() => setActiveModal(null)} />}
      {activeModal === 'database' && <DatabaseBreakdown contacts={MOCK_CONTACTS} onClose={() => setActiveModal(null)} />}
      {activeModal === 'control-center' && <ControlCenter onClose={() => setActiveModal(null)} />}
      {activeModal === 'add-contact' && <AddContactWizard onClose={() => setActiveModal(null)} initialData={prefilledLeadData} />}
      {activeModal === 'contact-finder' && <ContactFinder onClose={() => setActiveModal(null)} onVerify={handleLeadVerification} />}
      {activeModal === 'radar-scan' && <RadarScan onClose={() => setActiveModal(null)} onSelect={(poi) => handleLeadVerification({ company: poi.title })} />}
      {activeModal === 'bulk-upload' && <BulkUpload onClose={() => setActiveModal(null)} onInjest={(leads) => handleLeadVerification(leads[0])} />}
      {activeModal === 'scanner' && <Scanner onClose={() => setActiveModal(null)} onScan={handleLeadVerification} />}
    </div>
  );
};

export default App;
