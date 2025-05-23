
import Header from "./components/Header";
import Footer from "./components/Footer";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from "./Home";
import EmployeeHome from "./Employee/EmployeeHome";
import Profile from "./Profile";
import Application from "./Client/Application";
import Loginpage from "./Loginpage";
import Register from "./Register";
import ResetPasswordPage from "./ResetPasswordPage";
import ClientObjects from "./Client/ClientObjects";
import { AuthProvider } from "./AuthContext";

function App() {
  return (
    <AuthProvider>
    <div>
      <BrowserRouter>
      <Header/>
      <hr></hr>
        <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/menu" element={<EmployeeHome/>} />
        <Route path="/profile" element={<Profile/>} />
        <Route path="/objects" element={<ClientObjects/>}/>
        <Route path="/application" element={<Application/>} />
        <Route path="/login" element={<Loginpage/>}/>
        <Route path="/resetpassword" element={<ResetPasswordPage/>}/>
        <Route path="/register" element={<Register/>}/>
        </Routes>
      </BrowserRouter>
      <Footer/>
    </div>
    </AuthProvider>
  );
}

export default App;
