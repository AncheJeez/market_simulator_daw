import { useEffect, useState } from "react";
import { apiUrl } from "../utils/api";
import { User } from "../utils/auth";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          setError("Failed to fetch users. You might not have permission.");
        }
      } catch (err) {
        setError("An error occurred while fetching users.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <div className="p-4">Loading users...</div>;
  if (error) return <div className="p-4 text-danger">{error}</div>;

  return (
    <div className="container-fluid p-4">
      <h2 className="mb-4">User Administration</h2>
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>First Name</th>
                  <th>Second Name</th>
                  <th>Role</th>
                  <th>Profile Picture</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} onClick={() => navigate("/admin/user/" + user.id)} style={{ cursor: "pointer" }}>
                    <td>{user.id}</td>
                    <td>{user.userName}</td>
                    <td>{user.firstName}</td>
                    <td>{user.secondName}</td>
                    <td>
                      <span className={`badge ${user.userType === "ADMIN" ? "bg-danger" : user.userType === "MANAGER" ? "bg-warning text-dark" : "bg-primary"}`}>
                        {user.userType}
                      </span>
                    </td>
                    <td>
                      {user.profilePicturePath ? (
                        <img
                          src={apiUrl("/" + user.profilePicturePath)}
                          alt={user.userName}
                          className="rounded-circle"
                          style={{ width: "32px", height: "32px", objectFit: "cover" }}
                        />
                      ) : (
                        <span className="text-muted small">No image</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
