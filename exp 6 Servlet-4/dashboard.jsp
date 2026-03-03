<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="javax.servlet.http.*" %>

<%
    // Get existing session (don't create new one)
    HttpSession sessionObj = request.getSession(false);

    if(sessionObj == null || sessionObj.getAttribute("username") == null){
        response.sendRedirect("login.html");
        return;
    }

    String user = (String) sessionObj.getAttribute("username");
%>

<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Dashboard</title>

<style>
body{
    margin:0;
    height:100vh;
    display:flex;
    justify-content:center;
    align-items:center;
    font-family:Arial, sans-serif;
    background: linear-gradient(135deg,#43cea2,#185a9d);
}

.box{
    background:white;
    padding:40px;
    width:400px;
    border-radius:15px;
    text-align:center;
    box-shadow:0 15px 30px rgba(0,0,0,0.3);
}

h2{
    color:#185a9d;
}

p{
    font-size:16px;
    color:#333;
}

button{
    margin-top:20px;
    padding:12px 25px;
    border:none;
    border-radius:8px;
    background:#185a9d;
    color:white;
    font-size:16px;
    cursor:pointer;
    transition:0.3s;
}

button:hover{
    background:#0f3e6b;
}
</style>
</head>

<body>

<div class="box">
    <h2>Welcome <%= user %></h2>
    <p>You are successfully logged in.</p>

    <form action="LogoutServlet" method="post">
        <button type="submit">Logout</button>
    </form>
</div>

</body>
</html>