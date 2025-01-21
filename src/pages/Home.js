import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import 'react-toastify/dist/ReactToastify.css';

export default function Home() {
    const [users, setUsers] = useState([]);
    const { id } = useParams();

    useEffect(() => {
        loadUsers();

        // WebSocket setup using SockJS and STOMP
        const socket = new SockJS('http://localhost:8080/ws');  // Use SockJS with correct URL
        const stompClient = Stomp.over(socket);

        stompClient.connect({}, (frame) => {
            stompClient.subscribe('/topic/notifications', (message) => {
                toast.success(message.body);  // Show notification via toast
            });
        });

        return () => {
            if (stompClient) {
                stompClient.disconnect();
            }
        };
    }, []);

    const loadUsers = async () => {
        try {
            const result = await axios.get("http://localhost:8080/users");
            setUsers(result.data);
        } catch (error) {
            toast.error("Error loading users");
        }
    };

    const deleteUser = async (id) => {
        try {
            await axios.delete(`http://localhost:8080/user/${id}`);
            toast.success(`User with ID ${id} deleted successfully!`);
            loadUsers();
        } catch (error) {
            toast.error("Error deleting user");
        }
    }

    return (
        <div className='container'>
            <ToastContainer />  {/* This will display the notifications */}
            <div className='py-5'>
                <table className="table border shadow">
                    <thead>
                        <tr>
                            <th scope="col">Id</th>
                            <th scope="col">Name</th>
                            <th scope="col">Username</th>
                            <th scope="col">Email</th>
                            <th scope="col">Action</th>    
                        </tr>
                    </thead>
                    <tbody>
                        {
                            users.map((user, index) => (
                                <tr key={index}>
                                    <th scope="row">{index + 1}</th>
                                    <td>{user.name}</td>
                                    <td>{user.username}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        <Link className="btn btn-primary mx-2"
                                            to={`/viewuser/${user.id}`}>
                                            View
                                        </Link>
                                        <Link className="btn btn-outline-primary mx-2"
                                            to={`/edituser/${user.id}`}>
                                            Edit
                                        </Link>
                                        <button className="btn btn-danger mx-2"
                                            onClick={() => deleteUser(user.id)}>
                                            Delete
                                        </button>
                                    </td>  
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
        </div>
    );
}
