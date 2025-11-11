import AuthLogin from '../../components/shared/AuthLogin';
import { useNavigate } from 'react-router-dom';
import { loginAdmin as loginAdminAction } from "../../services/admin/admin.service";
import { useDispatch } from "react-redux";
import { UserType } from '../../utils/constants/roles';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (formData: { email: string; password: string }) => {
    try {

      const response = await loginAdminAction(formData,dispatch);
      console.log("response in handleSubmit in AdminLogin in AdminLogin.tsx",response)
      console.log("admin in handleSubmit in AdminLogin in AdminLogin.tsx",response?.admin)
      if (response) {
        console.log("navigating to /admin/")
        navigate('/admin/');
      }
    } catch (error) {
      console.error('Admin login failed:', error);
      throw error;
    }
  };

  return (
    <AuthLogin
      title="Admin Login"
    //   subtitle="Welcome Back to Groovia!"
    //   backgroundImage={loginImage}
      signupRoute=""
      onSubmit={handleSubmit}
      role={UserType.ADMIN}
    />
  );
};

export default AdminLogin;