import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useProductionStore } from './stores/productionStore';
import { useAppStore } from './stores/appStore';
import { migrationService } from './services/migration';
import { Layout } from './components/layout/Layout';
import { EntryView } from './components/entry/EntryView';
import { DashboardView } from './components/dashboard/DashboardView';
import { BatchesView } from './components/batches/BatchesView';
import { AdminView } from './components/admin/AdminView';
import { ReportsView } from './components/reports/ReportsView';
import { LoadingScreen } from './components/ui/LoadingScreen';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import './App.css';

function App() {
  const { 
    currentTab, 
    initialized, 
    setInitialized, 
    setCurrentTab 
  } = useAppStore();
  
  const { refreshAll } = useProductionStore();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🚀 Initializing Manufacturing Production Tracker...');
        
        // Run data migration from legacy localStorage
        await migrationService.migrateLegacyData();
        
        // Load all production data
        await refreshAll();
        
        // Check URL parameters for initial tab
        const urlParams = new URLSearchParams(window.location.search);
        const tabParam = urlParams.get('tab');
        const actionParam = urlParams.get('action');
        
        if (actionParam === 'clockin') {
          setCurrentTab('entry');
        } else if (tabParam && ['entry', 'dashboard', 'batches', 'admin', 'reports'].includes(tabParam)) {
          setCurrentTab(tabParam);
        }
        
        setInitialized(true);
        console.log('✅ App initialization complete');
        
      } catch (error) {
        console.error('❌ App initialization failed:', error);
        // Continue with initialization even if migration fails
        setInitialized(true);
      }
    };

    if (!initialized) {
      initializeApp();
    }
  }, [initialized, refreshAll, setInitialized, setCurrentTab]);

  if (!initialized) {
    return <LoadingScreen message="Initializing Production Tracker..." />;
  }

  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={
            <Layout>
              {currentTab === 'entry' && <EntryView />}
              {currentTab === 'dashboard' && <DashboardView />}
              {currentTab === 'batches' && <BatchesView />}
              {currentTab === 'admin' && <AdminView />}
              {currentTab === 'reports' && <ReportsView />}
            </Layout>
          } />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
