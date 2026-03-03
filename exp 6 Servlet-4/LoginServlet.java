package com.hello;   // your package name (check yours)

import java.io.*;
import javax.servlet.*;
import javax.servlet.http.*;
import javax.servlet.annotation.WebServlet;

@WebServlet("/LoginServlet")
public class LoginServlet extends HttpServlet {

    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String username = request.getParameter("username");
        String password = request.getParameter("password");

        if(username.equals("admin") && password.equals("1234")) {

            HttpSession session = request.getSession();
            session.setAttribute("username", username);

            response.sendRedirect("dashboard.jsp");

        } else {
            response.getWriter().println("Invalid Login");
        }
    }
}