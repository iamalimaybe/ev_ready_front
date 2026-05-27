import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import ChargerDirectory from './pages/ChargerDirectory';
import ContactUs from './pages/ContactUs';
import CostComparison from './pages/CostComparison';
import EvBikeSavingsCalculator from './pages/EvBikeSavingsCalculator';
import EvBikeVsPetrolGuide from './pages/guides/EvBikeVsPetrolGuide';
import HomeChargingGuide from './pages/guides/HomeChargingGuide';
import SolarEvChargingGuide from './pages/guides/SolarEvChargingGuide';
import Guides from './pages/Guides';
import HomeChargingCostEstimator from './pages/HomeChargingCostEstimator';
import Home from './pages/Home';
import LeadCapturePlaceholder from './pages/LeadCapturePlaceholder';
import RouteFeasibility from './pages/RouteFeasibility';
import SolarEvChargingEstimator from './pages/SolarEvChargingEstimator';
import SuitabilityCalculator from './pages/SuitabilityCalculator';
import VehicleCatalog from './pages/VehicleCatalog';
import './styles.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'ev-bike-savings', element: <EvBikeSavingsCalculator /> },
      { path: 'home-charging-cost', element: <HomeChargingCostEstimator /> },
      { path: 'solar-ev-charging', element: <SolarEvChargingEstimator /> },
      { path: 'suitability', element: <SuitabilityCalculator /> },
      { path: 'cost-comparison', element: <CostComparison /> },
      { path: 'route-feasibility', element: <RouteFeasibility /> },
      { path: 'vehicles', element: <VehicleCatalog /> },
      { path: 'chargers', element: <ChargerDirectory /> },
      { path: 'contact', element: <ContactUs /> },
      { path: 'guides', element: <Guides /> },
      { path: 'guides/ev-bike-vs-petrol', element: <EvBikeVsPetrolGuide /> },
      { path: 'guides/home-charging', element: <HomeChargingGuide /> },
      { path: 'guides/solar-ev-charging', element: <SolarEvChargingGuide /> },
      { path: 'get-help', element: <LeadCapturePlaceholder /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
