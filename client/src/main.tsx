import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import PlayQuiz from "./page/playQuiz"

const router = createBrowserRouter([
  {
    path: "/play/quiz/:roomId",
    element: <PlayQuiz/>,
  },
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
