import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useRole } from '../../context/RoleContext';
import { Loader2 } from '../../constants/icons';

const ProtectedRoute = ({ children, roles, plans }) => {
    const { user, loading, hasPlan } = useAuth();
    const { hasPermission } = useRole();

    // Wait until auth loading finishes
    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-primary-600" size={48} />
            </div>
        );
    }

    // If no user → go to login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // If user exists but role context not ready yet, allow render
    if (roles && user?.role && !hasPermission(roles)) {
        return <Navigate to="/unauthorized" replace />;
    }

    // Plan check
    if (plans && plans.length > 0 && !hasPlan(plans[0])) {
        return <Navigate to="/subscription" replace />;
    }

    return children;
};

export default ProtectedRoute;