import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Route, createRoutesFromElements } from "react-router-dom";
import PlayQuiz from "./page/playQuiz"
import EnterRoomId from "./page/selectQuizRoom"
import { AnimatePresence } from "framer-motion"
import 'bootstrap/dist/css/bootstrap.css';


const router = createBrowserRouter([
  {
    path: "/play/quiz/:roomId",
    element: <PlayQuiz/>,
  },
  {
    path: "/",
    element: <EnterRoomId/>,
  },
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AnimatePresence mode="wait">
      <RouterProvider router={router} />
    </AnimatePresence>
  </React.StrictMode>
)