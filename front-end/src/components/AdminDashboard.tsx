import { useEffect, useState } from "react";
import { apiUrl } from "../utils/api";
import { User } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import Pagination from "../components/reusables/Pagination";
import LoadingState from "../components/reusables/LoadingState";

const THEME = {
  bg: '#f8fafc',
  card: '#334155',
  border: '#475569',
  text: '#f1f5f9',
  muted: '#94a3b8',
  primary: '#fbbf24',
  success: '#22c55e',
  danger: '#ef4444',
  hover: '#3e4e63'
};

function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(apiUrl("/api/users"), {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        } else {
          setError("Failed to fetch users.");
        }
      } catch (err) {
        setError("An error occurred while fetching users.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = users.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(users.length / itemsPerPage);

  if (loading) {
    return (
      <div className="container-fluid p-4">
        <h2 className="mb-4 fw-bold" style={{ color: THEME.primary }}>User Administration</h2>
        <div className="card border-0 shadow-lg" style={{ backgroundColor: THEME.card }}>
          <div className="card-body py-5">
            <LoadingState message="Synchronizing User Records" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid p-4 text-center">
        <div className="p-4 rounded border" style={{ borderColor: THEME.danger, color: THEME.danger, backgroundColor: 'rgba(239, 64, 64, 0.05)' }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      <style>
        {`
          .admin-table, .admin-table > :not(caption) > * > * {
            background-color: transparent !important;
            color: ${THEME.text} !important;
            border-color: ${THEME.border} !important;
            box-shadow: none !important;
          }
          .admin-table tbody tr:hover {
            background-color: ${THEME.hover} !important;
          }
          .user-badge-admin {
            background-color: rgba(239, 68, 68, 0.15);
            color: ${THEME.danger};
            border: 1px solid ${THEME.danger};
            font-size: 0.7rem;
          }
          .user-badge-standard {
            background-color: rgba(251, 191, 36, 0.1);
            color: ${THEME.primary};
            border: 1px solid ${THEME.primary};
            font-size: 0.7rem;
          }
        `}
      </style>

      <h2 className="mb-4 fw-bold" style={{ color: THEME.primary }}>User Administration</h2>
      
      <div className="card border-0 shadow-lg" style={{ backgroundColor: THEME.card, color: THEME.text }}>
        <div className="card-body p-4">
          <div className="table-responsive">
            <table 
              className="table admin-table align-middle mx-auto" 
              style={{ minWidth: '800px', maxWidth: '1100px' }}
            >
              <thead style={{ backgroundColor: 'rgba(0,0,0,0.15)' }}>
                <tr>
                  <th className="border-0 px-3 py-2" style={{ color: THEME.muted, fontSize: '0.75rem', textTransform: 'uppercase', width: '80px' }}>ID</th>
                  <th className="border-0 px-3 py-2" style={{ color: THEME.muted, fontSize: '0.75rem', textTransform: 'uppercase', width: '200px' }}>Username</th>
                  <th className="border-0 px-3 py-2" style={{ color: THEME.muted, fontSize: '0.75rem', textTransform: 'uppercase' }}>Email</th>
                  <th className="border-0 px-3 py-2" style={{ color: THEME.muted, fontSize: '0.75rem', textTransform: 'uppercase', width: '120px' }}>Role</th>
                  <th className="border-0 px-3 py-2" style={{ color: THEME.muted, fontSize: '0.75rem', textTransform: 'uppercase', width: '150px' }}>Joined</th>
                  <th className="border-0 px-3 py-2 text-end" style={{ color: THEME.muted, fontSize: '0.75rem', textTransform: 'uppercase', width: '100px' }}>Profile</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((user) => (
                  <tr 
                    key={user.id} 
                    onClick={() => navigate("/admin/user/" + user.id)} 
                    style={{ cursor: "pointer", transition: '0.2s' }}
                  >
                    <td className="fw-bold px-3 py-2" style={{ color: THEME.primary }}>#{user.id}</td>
                    <td className="px-3 py-2">{user.userName}</td>
                    <td className="px-3 py-2" style={{ color: THEME.muted }}>{user.email || '—'}</td>
                    <td className="px-3 py-2">
                      <span className={`badge rounded-1 ${user.userType === "ADMIN" ? "user-badge-admin" : "user-badge-standard"}`}>
                        {user.userType}
                      </span>
                    </td>
                    <td className="px-3 py-2 small" style={{ color: THEME.muted }}>
                      {user.bornDate ? new Date(user.bornDate).toISOString().split('T')[0] : '—'}
                    </td>
                    <td className="px-3 py-2 text-end">
                      {user.profilePicturePath ? (
                        <img 
                          src={apiUrl("/" + user.profilePicturePath)} 
                          alt="" 
                          className="rounded-circle border" 
                          style={{ width: "28px", height: "28px", borderColor: THEME.border }} 
                        />
                      ) : (
                        <span style={{ fontSize: '0.7rem', color: THEME.muted }}>None</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 d-flex justify-content-center">
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={(page: any) => setCurrentPage(page)} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;