import { Navigate, Route, Routes } from "react-router-dom";

import { ProtectedRoute } from "./protected-route";
import { RoleRedirect } from "./role-redirect";
import { RoleRoute } from "./role-route";
import { AppLayout } from "../layouts/app-layout";

import { LoginPage } from "@/pages/login/ui/login-page";
import { ObjectsPage } from "@/pages/objects/ui/objects-page";
import { MyTasksPage } from "@/pages/my-tasks/ui/my-tasks-page";
import { ObjectDetailsPage } from "@/pages/object-details";
import { TaskDetailsPage } from "@/pages/task-details";

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<RoleRedirect />} />

          <Route element={<RoleRoute allowedRoles={["manager"]} />}>
            <Route path="/objects" element={<ObjectsPage />} />
          </Route>

          <Route element={<RoleRoute allowedRoles={["executor"]} />}>
            <Route path="/my-tasks" element={<MyTasksPage />} />
          </Route>

          <Route path="/objects/:objectId" element={<ObjectDetailsPage />} />
          <Route path="/tasks/:taskId" element={<TaskDetailsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
