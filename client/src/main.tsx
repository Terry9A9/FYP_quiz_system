import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import PlayQuiz from "./page/playQuiz"
import EnterRoomId from "./page/selectQuizRoom"
import 'bootstrap/dist/css/bootstrap.css';
import Drawing from "./page/drawing";
import DrawingCanvas from "./page/drawing";


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
    path: "/drawing",
    element: <DrawingCanvas width={400} height={400}/>,
  },
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
