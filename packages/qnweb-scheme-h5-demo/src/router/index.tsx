import { Navigate } from "react-router-dom";
import React from "react";
import { Home } from "@/pages/Home";
import { ShowDetail } from "@/pages/ShowDetail";
import { Search } from "@/pages/Search";

export default [
  {
    path: "/",
    element: <Navigate to="/list"></Navigate>,
  },
  {
    path: "list",
    element: <Home></Home>,
  },
  {
    path: "detail",
    element: <ShowDetail></ShowDetail>,
  },
  {
    path: "search",
    element: <Search></Search>,
  },
];
