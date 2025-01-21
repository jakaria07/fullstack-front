import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import './Navbar.css'; // Assuming you will create a separate CSS file for styling

function Navbar() {
  const [notifications, setNotifications] = useState([]);
  const [showTray, setShowTray] = useState(false); // To toggle the notification tray

  useEffect(() => {
    // Establish WebSocket connection
    const socket = new SockJS('http://localhost:8080/ws');
    const stompClient = Stomp.over(socket);

    stompClient.connect({}, function (frame) {
      stompClient.subscribe('/topic/notifications', function (notification) {
        setNotifications((prevNotifications) => [
          ...prevNotifications,
          notification.body,
        ]);
      });
    });

    return () => {
      if (stompClient) {
        stompClient.disconnect();
      }
    };
  }, []);

  const toggleTray = () => {
    setShowTray(!showTray); // Toggle the notification tray
  };

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">
            Full Stack Application
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav ms-auto"> {/* This pushes items to the right */}
              <li className="nav-item">
                {/* Add User button */}
                <Link className="btn btn-outline-light" to="/adduser">
                  Add User
                </Link>
              </li>

              <li className="nav-item dropdown">
                {/* Notification button */}
                <button
                  className="btn btn-light mx-2 position-relative"
                  onClick={toggleTray}
                >
                  <i className="fas fa-bell"></i>
                  <span className="badge bg-danger notification-count">
                    {notifications.length}
                  </span>
                </button>

                {/* Notification Tray */}
                {showTray && (
                  <div className="notification-tray">
                    <h5 className="tray-header">Notifications</h5>
                    <ul className="notification-list">
                      {notifications.length > 0 ? (
                        notifications.map((notification, index) => (
                          <li key={index} className="notification-item">
                            {notification}
                          </li>
                        ))
                      ) : (
                        <li className="notification-item">
                          No new notifications
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </li>
              
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default Navbar;
