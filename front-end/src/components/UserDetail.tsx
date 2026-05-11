import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiUrl } from "../utils/api";
import { User } from "../utils/auth";

function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [secondName, setSecondName] = useState("");
  const [userName, setUserName] = useState("");
  const [userType, setUserType] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(apiUrl("/api/users/" + id), {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data);
          setFirstName(data.firstName);
          setSecondName(data.secondName);
          setUserName(data.userName);
          setUserType(data.userType);
        } else {
          setError("Failed to fetch user details.");
        }
      } catch (err) {
        setError("An error occurred while fetching user.");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword && newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    const formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("secondName", secondName);
    formData.append("userName", userName);
    formData.append("userType", userType);
    if (newPassword) {
      formData.append("currentPassword", currentPassword);
      formData.append("newPassword", newPassword);
    }
    if (fileInputRef.current && fileInputRef.current.files && fileInputRef.current.files[0]) {
      formData.append("profilePicture", fileInputRef.current.files[0]);
    }

    try {
      const response = await fetch(apiUrl("/api/users/" + id + "/admin"), {
        method: "PUT",
        body: formData,
        credentials: "include",
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        setSuccess("User updated successfully.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        const data = await response.json();
        setError(data.message || "Failed to update user.");
      }
    } catch (err) {
      setError("An error occurred during update.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }
    try {
      const response = await fetch(apiUrl("/api/users/" + id), {
        method: "DELETE",
        credentials: "include",
      });
      if (response.ok) {
        navigate("/admin");
      } else {
        const data = await response.json();
        setError(data.message || "Failed to delete user.");
      }
    } catch (err) {
      setError("An error occurred during deletion.");
    }
  };

  if (loading) return <div className="p-4">Loading user details...</div>;
  if (!user) return <div className="p-4 text-danger">User not found.</div>;

  return (
    <div className="container p-4">
      <div className="d-flex justify-content-between mb-4">
        <h2>User: {user.userName}</h2>
        <button className="btn btn-secondary" onClick={() => navigate("/admin")}>Back</button>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      <div className="row">
        <div className="col-md-4 text-center">
          <img src={user.profilePicturePath ? apiUrl("/" + user.profilePicturePath) : "/default-user.jpg"} className="img-fluid rounded mb-3" />
          <button className="btn btn-danger w-100" onClick={handleDelete}>Delete User</button>
        </div>
        <div className="col-md-8">
          <form onSubmit={handleUpdate}>
            <div className="mb-3">
              <label className="form-label">First Name</label>
              <input className="form-control" value={firstName} onChange={e => setFirstName(e.target.value)} />
            </div>
            <div className="mb-3">
              <label className="form-label">Second Name</label>
              <input className="form-control" value={secondName} onChange={e => setSecondName(e.target.value)} />
            </div>
            <div className="mb-3">
              <label className="form-label">Username</label>
              <input className="form-control" value={userName} onChange={e => setUserName(e.target.value)} />
            </div>
            <div className="mb-3">
              <label className="form-label">Role</label>
              <select className="form-select" value={userType} onChange={e => setUserType(e.target.value)}>
                <option value="NORMAL">NORMAL</option>
                <option value="MANAGER">MANAGER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Profile Picture</label>
              <input type="file" className="form-control" ref={fileInputRef} />
            </div>
            <hr />
            <h5>Change Password</h5>
            <div className="mb-3">
              <label className="form-label">Current Password</label>
              <input type="password" class="form-control" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
            </div>
            <div className="mb-3">
              <label className="form-label">New Password</label>
              <input type="password" class="form-control" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            </div>
            <div className="mb-3">
              <label className="form-label">Confirm New Password</label>
              <input type="password" class="form-control" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </form>
        </div>
      </div>
    </div>
  );
}
export default UserDetail;
