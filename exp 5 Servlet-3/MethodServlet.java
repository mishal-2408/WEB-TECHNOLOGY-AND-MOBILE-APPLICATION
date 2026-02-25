package com.get;   // ⚠ keep your actual package name

import java.io.IOException;
import java.io.PrintWriter;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/MethodServlet")   // 🔥 VERY IMPORTANT
public class MethodServlet extends HttpServlet {

    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String name = request.getParameter("name");

        response.setContentType("text/html");
        PrintWriter out = response.getWriter();

        out.println("<html><body style='text-align:center;font-family:Arial;background:#e3f2fd;'>");
        out.println("<h1 style='color:blue;'>GET Method Used</h1>");
        out.println("<h2>Hello " + name + "</h2>");
        out.println("</body></html>");
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String name = request.getParameter("name");

        response.setContentType("text/html");
        PrintWriter out = response.getWriter();

        out.println("<html><body style='text-align:center;font-family:Arial;background:#ffebee;'>");
        out.println("<h1 style='color:red;'>POST Method Used</h1>");
        out.println("<h2>Hello " + name + "</h2>");
        out.println("</body></html>");
    }
}