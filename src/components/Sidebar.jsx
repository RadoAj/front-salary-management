import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MdBusinessCenter, MdHome, MdDashboard, MdApartment, MdPeople, MdAttachMoney, MdAssignment, MdStar, MdRemoveCircleOutline } from "react-icons/md"; // Material Design Icons

function Sidebar() {
  const location = useLocation();

  return (
    <nav className="pc-sidebar">
      <div className="navbar-wrapper">
        <div className="m-header" style={{ display: 'flex', alignItems: 'center', fontWeight: 'bold', fontSize: '18px' }}>
          <MdBusinessCenter style={{ color: '#3e97ff', marginRight: '10px' }} size={24} />
          Gestion des salaires
        </div>
        <div className="navbar-content">
          <ul className="pc-navbar">
            <li className={`pc-item ${location.pathname === '/' ? 'active' : ''}`}>
              <Link to="/" className="pc-link">
                <MdHome className="pc-micon" />
                <span className="pc-mtext">Accueil</span>
              </Link>
            </li>

            <li className="pc-item pc-caption">
              <label>Pages</label>
              <i className="ti ti-dashboard"></i>
            </li>

            <li className={`pc-item ${location.pathname === '/dashboard' ? 'active' : ''}`}>
              <Link to="/dashboard" className="pc-link">
                <MdDashboard className="pc-micon" />
                <span className="pc-mtext">Tableau de bord</span>
              </Link>
            </li>

            <li className={`pc-item ${location.pathname === '/department' ? 'active' : ''}`}>
              <Link to="/department" className="pc-link">
                <MdApartment className="pc-micon" />
                <span className="pc-mtext">Départements</span>
              </Link>
            </li>

            <li className={`pc-item ${location.pathname === '/employes' ? 'active' : ''}`}>
              <Link to="/employes" className="pc-link">
                <MdPeople className="pc-micon" />
                <span className="pc-mtext">Employés</span>
              </Link>
            </li>

            <li className={`pc-item ${location.pathname === '/salary' ? 'active' : ''}`}>
              <Link to="/salary" className="pc-link">
                <MdAttachMoney className="pc-micon" />
                <span className="pc-mtext">Salaires</span>
              </Link>
            </li>

            <li className={`pc-item ${location.pathname === '/bonus' ? 'active' : ''}`}>
              <Link to="/bonus" className="pc-link">
                <MdStar className="pc-micon" />
                <span className="pc-mtext">Bonus</span>
              </Link>
            </li>

            <li className={`pc-item ${location.pathname === '/deduction' ? 'active' : ''}`}>
              <Link to="/deduction" className="pc-link">
                <MdRemoveCircleOutline className="pc-micon" />
                <span className="pc-mtext">Déductions</span>
              </Link>
            </li>

            <li className={`pc-item ${location.pathname === '/payroll' ? 'active' : ''}`}>
              <Link to="/payroll" className="pc-link">
                <MdAssignment className="pc-micon" />
                <span className="pc-mtext">Fiches de Paie</span>
              </Link>
            </li>

          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Sidebar;