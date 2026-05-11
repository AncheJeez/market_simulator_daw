import { useEffect, useState } from "react";
import { apiUrl } from "../utils/api";
import { User } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import Pagination from "../components/reusables/Pagination";

function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination State
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

  // Calculate Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = users.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(users.length / itemsPerPage);

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
                  <th>Role</th>
                  <th>Profile Picture</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((user) => (
                  <tr key={user.id} onClick={() => navigate("/admin/user/" + user.id)} style={{ cursor: "pointer" }}>
                    <td>{user.id}</td>
                    <td>{user.userName}</td>
                    <td>
                      <span className={`badge ${user.userType === "ADMIN" ? "bg-danger" : "bg-primary"}`}>
                        {user.userType}
                      </span>
                    </td>
                    <td>
                      {user.profilePicturePath ? (
                        <img src={apiUrl("/" + user.profilePicturePath)} alt="" className="rounded-circle" style={{ width: "32px", height: "32px" }} />
                      ) : "No image"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={(page: any) => setCurrentPage(page)} 
          />
          
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;