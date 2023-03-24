import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Route, createRoutesFromElements } from "react-router-dom";
import PlayQuiz from "./page/playQuiz"
import EnterRoomId from "./page/selectQuizRoom"
import { AnimatePresence } from "framer-motion"
import 'bootstrap/dist/css/bootstrap.css';
import LoginLogoutButton from './page/login';

import CreateRoomForm from './page/CRoom';
const router = createBrowserRouter([
  {
    path: "/play/quiz/:roomId",
    element: <PlayQuiz/>,
  },
  {
    path: "/",
    element: <EnterRoomId/>,
  },
  {
    path: "/login",
    element: <LoginLogoutButton/>,
  },{
    path: "/CRoom",
    element: <CreateRoomForm/>,
  },
  // {
  //   path: "/drawing",
  //   element: <DrawingCanvas width={400} height={400}/>,
  // },
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AnimatePresence mode="wait">
      <RouterProvider router={router} />
    </AnimatePresence>
  </React.StrictMode>
)