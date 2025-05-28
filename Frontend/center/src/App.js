import Header from "./components/Header";
import Footer from "./components/Footer";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from "./Home";
import Profile from "./Profile";
import Loginpage from "./Loginpage";
import Register from "./Register";
import ResetPasswordPage from "./ResetPasswordPage";
import ClientObjects from "./Client/ClientObjects";
import ServiceCatalog from "./ServiceCatalog";
import EmployeeHome from "./Employee/EmployeeHome";
import Applications from "./Employee/Applications";
import Brigades from "./Employee/Brigades";
import Clients from "./Employee/Clients";
import Employers from "./Employee/Employers";
import Jobtitles from "./Employee/Jobtitles";
import Objects from "./Employee/Objects";
import SelectedServices from "./Employee/SelectedServices";
import Services from "./Employee/Services";
import SurveyAgreement from "./Employee/SurveyAgreement";
import SurveyReports from "./Employee/SurveyReports";
import Users from "./Employee/Users";

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
        <Route path="/catalog" element={<ServiceCatalog/>} />
        <Route path="/profile" element={<Profile/>} />
        <Route path="/clientobjects" element={<ClientObjects/>}/>
        <Route path="/login" element={<Loginpage/>}/>
        <Route path="/resetpassword" element={<ResetPasswordPage/>}/>
        <Route path="/register" element={<Register/>}/>
        <Route path="/menu" element={<EmployeeHome/>} />
        <Route path="/applications" element={<Applications/>}/>
        <Route path="/brigades" element={<Brigades/>}/>
        <Route path="/clients" element={<Clients/>}/>
        <Route path="/employers" element={<Employers/>}/>
        <Route path="/jobtitles" element={<Jobtitles/>}/>
        <Route path="/objects" element={<Objects/>}/>
        <Route path="/selectedservices" element={<SelectedServices/>}/>
        <Route path="/services" element={<Services/>}/>
        <Route path="/surveyagreement" element={<SurveyAgreement/>}/>
        <Route path="/surveyreports" element={<SurveyReports/>}/>
        <Route path="/users" element={<Users/>}/>
        </Routes>
      </BrowserRouter>
      <hr style={{border: 'none', borderTop: '5px solid transparent'}}></hr>
      <Footer/>
    </div>
    </AuthProvider>
  );
}

export default App;
