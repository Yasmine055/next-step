import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';

// Composants Datacenters et Cloud
import DatacenterList from './components/cloud/DatacenterList';
import DatacenterForm from './components/cloud/DatacenterForm';
import DatacenterEdit from './components/cloud/DatacenterEdit';
import CategoryList from './components/cloud/CategoryList';
import EquipmentTypeList from './components/cloud/EquipmentTypeList';
import EquipmentTypeForm from './components/cloud/EquipmentTypeForm';
import DynamicEquipmentForm from './components/cloud/DynamicEquipmentForm';
import EquipmentTypeDetails from './components/cloud/EquipmentTypeDetails';

// Composants Réseau
import ReseauEquipmentTypeList from './components/reseaux/ReseauEquipmentTypeList';
import ReseauEquipmentTypeForm from './components/reseaux/ReseauEquipmentTypeForm';
import ReseauEquipmentTypeDetails from './components/reseaux/ReseauEquipmentTypeDetails';
import ReseauEquipmentList from './components/reseaux/ReseauEquipmentList';
import ReseauDynamicEquipmentForm from './components/reseaux/ReseauDynamicEquipmentForm';
import UserList from './components/user/UserList';
import UserForm from './components/user/UserForm';
import LoginPage from './components/user/LoginPage';
import UserProfile from './components/user/UserProfile';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Route publique - Page de connexion */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Redirection de la racine vers /reseau/types */}
          <Route path="/" element={<Navigate to="/reseau/types" replace />} />

          {/* Routes protégées - Datacenters */}
          <Route path="/datacenters" element={
            <PrivateRoute>
              <DatacenterList />
            </PrivateRoute>
          } />
          <Route path="/datacenters/ajouter" element={
            <PrivateRoute>
              <DatacenterForm />
            </PrivateRoute>
          } />
          <Route path="/datacenters/modifier/:id" element={
            <PrivateRoute>
              <DatacenterEdit />
            </PrivateRoute>
          } />
          
          {/* Routes protégées - Catégories */}
          <Route path="/datacenters/:datacenterId/categories" element={
            <PrivateRoute>
              <CategoryList />
            </PrivateRoute>
          } />
          
          {/* Routes protégées - Types d'équipement */}
          <Route path="/datacenters/:datacenterId/categories/:categoryId/equipment-types" element={
            <PrivateRoute>
              <EquipmentTypeList />
            </PrivateRoute>
          } />
          <Route path="/datacenters/:datacenterId/categories/:categoryId/equipment-types/new" element={
            <PrivateRoute>
              <EquipmentTypeForm />
            </PrivateRoute>
          } />
          <Route path="/datacenters/:datacenterId/categories/:categoryId/equipment-types/:typeId/edit" element={
            <PrivateRoute>
              <EquipmentTypeForm />
            </PrivateRoute>
          } />
          
          {/* Routes protégées - Équipements */}
          <Route path="/datacenters/:datacenterId/equipment-types/:typeId/equipments" element={
            <PrivateRoute>
              <EquipmentTypeDetails />
            </PrivateRoute>
          } />
          <Route path="/datacenters/:datacenterId/equipments/add/:typeId" element={
            <PrivateRoute>
              <DynamicEquipmentForm />
            </PrivateRoute>
          } />

          {/* Routes protégées - Réseau - Types d'équipements réseau */}
          <Route path="/reseau/types" element={
            <PrivateRoute>
              <ReseauEquipmentTypeList />
            </PrivateRoute>
          } />
          <Route path="/reseau/types/new" element={
            <PrivateRoute>
              
              <ReseauEquipmentTypeForm />
            </PrivateRoute>
          } />
          <Route path="/reseau/types/:id/edit" element={
            <PrivateRoute>
              <ReseauEquipmentTypeForm />
            </PrivateRoute>
          } />
          <Route path="/reseau/types/:id" element={
            <PrivateRoute>
              <ReseauEquipmentTypeDetails />
            </PrivateRoute>
          } />

          {/* Routes protégées - Réseau - Équipements réseau */}
          <Route path="/reseau/equipements" element={
            <PrivateRoute>
              <ReseauEquipmentList />
            </PrivateRoute>
          } />
          <Route path="/reseau/equipements/new/:typeId" element={
            <PrivateRoute>
              <ReseauDynamicEquipmentForm />
            </PrivateRoute>
          } />
          <Route path="/reseau/equipements/new" element={
            <PrivateRoute>
              <ReseauDynamicEquipmentForm />
            </PrivateRoute>
          } />
          <Route path="/reseau/equipements/:id/edit" element={
            <PrivateRoute>
              <ReseauDynamicEquipmentForm />
            </PrivateRoute>
          } />

          {/* Routes protégées - Utilisateurs */}
          <Route path="/users" element={
            <PrivateRoute>
              <UserList />
            </PrivateRoute>
          } />
          <Route path="/users/add" element={
            <PrivateRoute>
              <UserForm />
            </PrivateRoute>
          } />
          <Route path="/users/edit/:id" element={
            <PrivateRoute>
              <UserForm editMode={true} />
            </PrivateRoute>
          } />
          <Route path="/profile" element={
            <PrivateRoute>
              <UserProfile />
            </PrivateRoute>
          } />

          {/* Route 404 */}
          <Route path="*" element={<h2>Page non trouvée</h2>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;