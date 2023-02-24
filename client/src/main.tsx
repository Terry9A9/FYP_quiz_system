import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import PlayQuiz from "./page/playQuiz"
import EnterRoomId from "./page/selectQuizRoom"
import Cheat from "./page/cheat"
import 'bootstrap/dist/css/bootstrap.css';

const router = createBrowserRouter([
  {
    path: "/play/quiz/:roomId",
    element: <PlayQuiz/>,
  },
  {
    path: "/",
    element: <EnterRoomId/>,
  },{
    path: "/a",
    element: <Cheat/>,

  }
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
