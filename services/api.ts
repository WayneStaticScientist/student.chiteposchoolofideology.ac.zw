import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/login")
    ) {
      originalRequest._retry = true;
      try {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );

        return api(originalRequest);
      } catch (err) {
        // If refresh fails, we could redirect to login or clear state
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }

        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  },
);

export const submitEnrollment = async (data: any) => {
  const response = await api.post("/enrollments", data);

  return response.data;
};

export const registerUser = async (data: any) => {
  const response = await api.post("/users/register", data);

  return response.data;
};

export const loginUser = async (data: any) => {
  const response = await api.post("/auth/login", data);

  return response.data;
};

export const checkEnrollmentStatus = async (data: {
  firstName: string;
  lastName: string;
  nationalId: string;
}) => {
  const response = await api.post("/enrollments/status", data);

  return response.data;
};

export const getEnrollmentByNationalId = async (nationalId: string) => {
  const response = await api.get(`/enrollments/${nationalId}`);

  return response.data;
};

export const getStudentDashboard = async () => {
  const response = await api.get("/users/me/dashboard");

  return response.data;
};

export const startQuizAttempt = async (quizId: string) => {
  const response = await api.get(`/topics/quiz/${quizId}/start`);

  return response.data;
};

export const submitQuizAttempt = async (attemptId: string, answers: any[]) => {
  const response = await api.post(`/topics/quiz-attempt/${attemptId}/submit`, {
    answers,
  });

  return response.data;
};

export const getCourseSchedules = async (courseId: string) => {
  const response = await api.get(`/live/course/${courseId}`);

  return response.data;
};

export const getStudentSchedules = async () => {
  const response = await api.get("/live/student");

  return response.data;
};

export const generateLiveToken = async (scheduleId: string) => {
  const response = await api.post(`/live/token/${scheduleId}`);

  return response.data;
};

export const getPaymentHistory = async () => {
  const response = await api.get("/payments/history");

  return response.data;
};

export const initiatePayment = async (data: {
  amount: number;
  method: string;
  phone?: string;
}) => {
  const response = await api.post("/payments/initiate", data);

  return response.data;
};

export const checkPaymentStatus = async (paymentId: string) => {
  const response = await api.get(`/payments/status/${paymentId}`);

  return response.data;
};

export const getStudentGrades = async () => {
  const response = await api.get("/users/me/grades");

  return response.data;
};

export const logout = async () => {
  const response = await api.post("/auth/logout");

  return response.data;
};

export default api;
