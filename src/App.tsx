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
  // EMERGENCY: Force white background with inline styles to override ANY CSS
  const forceWhiteStyles = {
    backgroundColor: '#ffffff',
    background: '#ffffff',
    minHeight: '100vh',
    width: '100%'
  };
  const { 
    currentTab, 
    initialized, 
    setInitialized, 
    setCurrentTab 
  } = useAppStore();
  
  const { 
    refreshAll, 
    products, 
    employees, 
    tasks,
    addProduct, 
    addEmployee, 
    addTask 
  } = useProductionStore();

  // Initialize default data if database is empty
  const initializeDefaultData = async () => {
    // Check if we already have data
    if (products.length > 0 && employees.length > 0) {
      return; // Data already exists
    }
    
    console.log('Creating default data for new installation...');
    
    // Create default products
    if (products.length === 0) {
      await addProduct({ name: 'HUSH 1.0g Cart', type: 'Cartridge', active: true });
      await addProduct({ name: 'HUSTLE 1.0g AIO', type: 'AIO Device', active: true });
      await addProduct({ name: 'Premium Disposable', type: 'Disposable', active: true });
      await addProduct({ name: 'Pod System', type: 'Pod', active: true });
    }
    
    // Create default employees
    if (employees.length === 0) {
      await addEmployee({ 
        name: 'Demo Operator', 
        role: 'Operator', 
        shift: 'Day', 
        active: true, 
        rbacRoles: ['operator'] 
      });
      await addEmployee({ 
        name: 'Demo Lead', 
        role: 'Lead Operator', 
        shift: 'Day', 
        active: true, 
        rbacRoles: ['lead', 'operator'] 
      });
      await addEmployee({ 
        name: 'Demo Supervisor', 
        role: 'Supervisor', 
        shift: 'Day', 
        active: true, 
        rbacRoles: ['supervisor', 'lead', 'operator'] 
      });
    }
    
    // Create default tasks (after products are created)
    if (tasks.length === 0 && products.length > 0) {
      // Reload products to get the IDs
      await refreshAll();
      const cartProduct = products.find(p => p.name.includes('HUSH'));
      const aioProduct = products.find(p => p.name.includes('HUSTLE'));
      
      if (cartProduct) {
        await addTask({ 
          name: 'C SOLO Filling', 
          quota: 120, 
          productId: cartProduct.id, 
          description: 'Fill cartridges with C SOLO solution',
          standardCycleTime: 30 
        });
        await addTask({ 
          name: 'Capping', 
          quota: 180, 
          productId: cartProduct.id, 
          description: 'Apply caps to filled cartridges',
          standardCycleTime: 20 
        });
      }
      
      if (aioProduct) {
        await addTask({ 
          name: 'Label Stickering', 
          quota: 200, 
          productId: aioProduct.id, 
          description: 'Apply labels to AIO devices',
          standardCycleTime: 18 
        });
        await addTask({ 
          name: 'Packaging & Sealing', 
          quota: 150, 
          productId: aioProduct.id, 
          description: 'Package and seal AIO devices',
          standardCycleTime: 24 
        });
      }
    }
  };

  // EMERGENCY: Force white background via JavaScript
  useEffect(() => {
    const forceWhiteBackground = () => {
      document.documentElement.style.backgroundColor = '#ffffff';
      document.documentElement.style.background = '#ffffff';
      document.body.style.backgroundColor = '#ffffff';
      document.body.style.background = '#ffffff';
      
      // Force white on any element that might have yellow
      const allElements = document.querySelectorAll('*');
      allElements.forEach(el => {
        if (el instanceof HTMLElement) {
          const computedStyle = window.getComputedStyle(el);
          if (computedStyle.backgroundColor.includes('255, 255, 0') || 
              computedStyle.backgroundColor.includes('yellow') ||
              computedStyle.background.includes('yellow')) {
            el.style.backgroundColor = '#ffffff';
            el.style.background = '#ffffff';
          }
        }
      });
    };
    
    // Force white immediately and on any DOM changes
    forceWhiteBackground();
    const observer = new MutationObserver(forceWhiteBackground);
    observer.observe(document.body, { childList: true, subtree: true });
    
    return () => observer.disconnect();
  }, []);

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
        
        // Initialize default data if empty (graceful failure)
        try {
          await initializeDefaultData();
          console.log('📦 Default data initialized');
        } catch (initError) {
          console.warn('⚠️ Failed to initialize default data:', initError);
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
    <div style={forceWhiteStyles}>
      <ErrorBoundary>
        <Router>
          <div style={forceWhiteStyles}>
            <Routes>
              <Route path="/" element={
                <div style={forceWhiteStyles}>
                  <Layout>
                    {currentTab === 'entry' && <EntryView />}
                    {currentTab === 'dashboard' && <DashboardView />}
                    {currentTab === 'batches' && <BatchesView />}
                    {currentTab === 'admin' && <AdminView />}
                    {currentTab === 'reports' && <ReportsView />}
                  </Layout>
                </div>
              } />
            </Routes>
          </div>
        </Router>
      </ErrorBoundary>
    </div>
  );
}

export default App;
