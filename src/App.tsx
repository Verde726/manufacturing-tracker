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
        
        // Run data migration from legacy localStorage (graceful failure)
        try {
          const migrationResult = await migrationService.migrateLegacyData();
          console.log('📊 Migration result:', migrationResult);
        } catch (migrationError) {
          console.warn('⚠️ Migration failed, continuing with fresh initialization:', migrationError);
        }
        
        // Load all production data (graceful failure)
        try {
          await refreshAll();
          console.log('📊 Production data loaded');
        } catch (dataError) {
          console.warn('⚠️ Failed to load production data, continuing with empty state:', dataError);
        }
        
        // Check URL parameters for initial tab
        try {
          const urlParams = new URLSearchParams(window.location.search);
          const tabParam = urlParams.get('tab');
          const actionParam = urlParams.get('action');
          
          if (actionParam === 'clockin') {
            setCurrentTab('entry');
          } else if (tabParam && ['entry', 'dashboard', 'batches', 'admin', 'reports'].includes(tabParam)) {
            setCurrentTab(tabParam);
          }
        } catch (urlError) {
          console.warn('⚠️ Failed to parse URL parameters:', urlError);
        }
        
        setInitialized(true);
        console.log('✅ App initialization complete');
        
      } catch (error) {
        console.error('❌ App initialization failed:', error);
        // Continue with initialization even if everything fails
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
