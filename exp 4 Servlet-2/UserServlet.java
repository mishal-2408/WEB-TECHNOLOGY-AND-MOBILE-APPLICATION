import java.io.*;
import javax.servlet.*;
import javax.servlet.http.*;
import javax.servlet.annotation.WebServlet;

@WebServlet("/UserServlet")
public class UserServlet extends HttpServlet {

    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String name = request.getParameter("username");
        String age = request.getParameter("age");

        response.setContentType("text/html");
        PrintWriter out = response.getWriter();

        out.println("<html><body style='font-family:Arial;text-align:center;background:#f5f7fa;'>");
        out.println("<h1 style='color:green;'>Welcome " + name + "!</h1>");
        out.println("<h2>Your Age is: " + age + "</h2>");
        out.println("</body></html>");
    }
}