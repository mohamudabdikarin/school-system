import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';  // لاستخدام التنقل بين الصفحات برمجياً
import axios from '../api/axios';  // استدعاء مكتبة axios المخصصة لعمل طلبات HTTP
import { jwtDecode } from 'jwt-decode';  // لفك تشفير الـ JWT token

// إنشاء Context خاص بالمصادقة (Auth)
export const AuthContext = createContext(null);

// مزود AuthProvider الذي يحتوي على كل منطق المصادقة ويحوي الحالات (states) والدوال
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);  // حالة المستخدم الحالي، null تعني لا يوجد مستخدم مسجل دخول
  const [authLoading, setAuthLoading] = useState(true);  // حالة تحميل التحقق من المصادقة (true أثناء التحقق)
  const navigate = useNavigate();  // دالة تستخدم للتنقل برمجياً بين الصفحات

  // useEffect ينفذ مرة وحدة عند تحميل الكومبوننت للتحقق من وجود توكن في sessionStorage
  useEffect(() => {
    // جلب التوكن من التخزين المؤقت في المتصفح
    const token = sessionStorage.getItem('token');
    if (token) {
      try {
        // فك تشفير التوكن للحصول على بيانات المستخدم والصلاحية وتاريخ انتهاء الصلاحية
        const decodedToken = jwtDecode(token);

        // التحقق إذا انتهت صلاحية التوكن
        if (decodedToken.exp * 1000 < Date.now()) {
          // إذا انتهت الصلاحية: إزالة التوكن وتعيين المستخدم null
          sessionStorage.removeItem('token');
          setUser(null);
        } else {
          // إذا التوكن صحيح: إضافة التوكن لaxios ليتم ارساله في كل طلب
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          // تعيين بيانات المستخدم من التوكن في الحالة user
          setUser({
            userId: decodedToken.userId,
            schoolId: decodedToken.sub,
            role: decodedToken.role,
          });
        }
      } catch (error) {
        // إذا التوكن غير صالح (مثلاً معطوب أو غير صحيح)
        console.error("Invalid token in sessionStorage:", error);
        sessionStorage.removeItem('token');  // إزالة التوكن
        setUser(null);  // إلغاء بيانات المستخدم
      }
    }
    setAuthLoading(false);  // انتهاء عملية التحقق
  }, []);  // [] تعني ينفذ مرة واحدة فقط عند التحميل

  // دالة تسجيل الدخول (تأخذ userId و password)
  const login = async (userId, password) => {
    try {
      // ارسال طلب تسجيل الدخول للسيرفر (POST) مع بيانات المستخدم
      const response = await axios.post('/auth/login', { userId, password });
      const { token } = response.data;  // استقبال التوكن من الرد

      // تخزين التوكن في sessionStorage
      sessionStorage.setItem('token', token);

      // إعداد axios لإرسال التوكن في هيدر كل طلب
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // فك تشفير التوكن واستخراج بيانات المستخدم
      const decodedToken = jwtDecode(token);
      setUser({
        userId: decodedToken.userId,
        schoolId: decodedToken.sub,
        role: decodedToken.role,
      });

      // توجيه المستخدم حسب دوره بعد تسجيل الدخول
      switch (decodedToken.role) {
        case 'ROLE_ADMIN':
          navigate('/admin');  // يذهب لصفحة الإدارة
          break;
        case 'ROLE_TEACHER':
          navigate('/teacher');  // يذهب لصفحة المعلم
          break;
        case 'ROLE_STUDENT':
          navigate('/student');  // يذهب لصفحة الطالب
          break;
        default:
          navigate('/');  // توجيه افتراضي
      }
    } catch (error) {
      // في حالة فشل تسجيل الدخول (كلمة مرور خطأ مثلا)
      console.error('Login failed:', error);
      throw error;  // رفع الخطأ لكي يعالجه مكان استدعاء الدالة
    }
  };

  // دالة تسجيل الخروج
  const logout = () => {
    setUser(null);  // حذف بيانات المستخدم من الحالة
    sessionStorage.removeItem('token');  // إزالة التوكن من التخزين
    delete axios.defaults.headers.common['Authorization'];  // إزالة التوكن من axios
    navigate('/login');  // الذهاب لصفحة تسجيل الدخول
  };

  // القيم التي سيتم توفيرها لأي مكون يستخدم هذا السياق
  const value = { user, login, logout, authLoading };

  return (
    <AuthContext.Provider value={value}>
      {/* عرض المحتوى (children) فقط إذا انتهينا من التحقق من التوكن */}
      {!authLoading && children}
    </AuthContext.Provider>
  );
};

// هوك مخصص لاستخدام سياق المصادقة بسهولة في أي مكون
export const useAuth = () => useContext(AuthContext);
