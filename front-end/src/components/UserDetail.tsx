import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiUrl } from "../utils/api";
import { User } from "../utils/auth";
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
  const [email, setEmail] = useState("");
  const [bornDate, setBornDate] = useState("");
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
          setFirstName(data.firstName || "");
          setSecondName(data.secondName || "");
          setUserName(data.userName || "");
          setEmail(data.email || "");
          setBornDate(data.bornDate ? data.bornDate.split('T')[0] : "");
          setUserType(data.userType || "NORMAL");
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
    formData.append("email", email);
    formData.append("bornDate", bornDate);
    formData.append("userType", userType);
    if (newPassword) {
      formData.append("currentPassword", currentPassword);
      formData.append("newPassword", newPassword);
    }
    if (fileInputRef.current?.files?.[0]) {
      formData.append("profilePicture", fileInputRef.current.files[0]);
    }

    try {
      const response = await fetch(apiUrl(`/api/users/${id}/admin`), {
        method: "PUT",
        body: formData,
        credentials: "include",
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        setSuccess("Profile synchronized successfully.");
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
    if (!window.confirm("Permanent Action: Are you sure you want to delete this user?")) return;
    try {
      const response = await fetch(apiUrl("/api/users/" + id), {
        method: "DELETE",
        credentials: "include",
      });
      if (response.ok) navigate("/admin");
    } catch (err) {
      setError("An error occurred during deletion.");
    }
  };

  if (loading) {
    return (
      <div className="container p-4">
        <div className="card border-0 shadow-lg" style={{ backgroundColor: THEME.card }}>
          <LoadingState message="Accessing User Archive..." />
        </div>
      </div>
    );
  }

  return (
    <div className="container p-4">
      <style>
        {`
          .form-control, .form-select {
            background-color: rgba(0,0,0,0.2) !important;
            border: 1px solid ${THEME.border} !important;
            color: ${THEME.text} !important;
          }
          .form-control:focus, .form-select:focus {
            border-color: ${THEME.primary} !important;
            box-shadow: 0 0 0 0.25rem rgba(251, 191, 36, 0.15) !important;
          }
          .label-custom { color: ${THEME.muted}; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; }
          .section-divider { border-top: 1px solid ${THEME.border}; margin: 2rem 0; position: relative; }
          .section-title { 
            position: absolute; top: -12px; left: 20px; 
            background: ${THEME.card}; padding: 0 10px; 
            color: ${THEME.primary}; font-size: 0.75rem; font-weight: bold; 
          }
          .form-control::placeholder {
            color: ${THEME.muted} !important;
            opacity: 0.6;
            font-weight: 400;
          }
          .form-control::-webkit-input-placeholder { color: ${THEME.muted} !important; }
          .form-control::-moz-placeholder { color: ${THEME.muted} !important; }
        `}
      </style>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-0" style={{ color: THEME.primary }}>Edit Profile</h2>
          <span style={{ color: THEME.muted }}>System ID: #{id}</span>
        </div>
        <button className="btn btn-outline-light btn-sm px-4" onClick={() => navigate("/admin")}>
          Return to Dashboard
        </button>
      </div>

      {error && <div className="alert border-0 text-white mb-4" style={{ backgroundColor: THEME.danger }}>{error}</div>}
      {success && <div className="alert border-0 text-white mb-4" style={{ backgroundColor: THEME.success }}>{success}</div>}

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm p-4 text-center" style={{ backgroundColor: THEME.card, color: THEME.text }}>
            <div className="mb-4 position-relative d-inline-block">
              <img 
                src={user?.profilePicturePath ? apiUrl("/" + user.profilePicturePath) : "/default-user.jpg"} 
                className="rounded-circle border border-4 shadow" 
                style={{ width: "160px", height: "160px", objectFit: "cover", borderColor: THEME.border }} 
              />
              <span className="badge position-absolute bottom-0 end-0 rounded-pill px-3 py-2" style={{ backgroundColor: THEME.primary, color: '#000' }}>
                {userType}
              </span>
            </div>
            <h4 className="fw-bold">{userName}</h4>
            <p style={{ color: THEME.muted }}>{email}</p>
            
            <div className="mt-4 pt-4 border-top" style={{ borderColor: THEME.border }}>
              <button className="btn btn-outline-danger w-100" onClick={handleDelete}>
                Terminate User Access
              </button>
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card border-0 shadow-sm p-4" style={{ backgroundColor: THEME.card, color: THEME.text }}>
            <form onSubmit={handleUpdate}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="label-custom">First Name</label>
                  <input className="form-control" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Enter first name" />
                </div>
                <div className="col-md-6">
                  <label className="label-custom">Second Name</label>
                  <input className="form-control" value={secondName} onChange={e => setSecondName(e.target.value)} placeholder="Enter second name" />
                </div>
                <div className="col-md-6">
                  <label className="label-custom">Primary Email</label>
                  <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div className="col-md-6">
                  <label className="label-custom">Date of Birth</label>
                  <input type="date" className="form-control" value={bornDate} onChange={e => setBornDate(e.target.value)} />
                </div>
                <div className="col-md-6">
                  <label className="label-custom">Username</label>
                  <input className="form-control" value={userName} onChange={e => setUserName(e.target.value)} />
                </div>
                <div className="col-md-6">
                  <label className="label-custom">Access Level</label>
                  <select className="form-select" value={userType} onChange={e => setUserType(e.target.value)}>
                    <option value="NORMAL">Standard User</option>
                    <option value="MANAGER">Manager</option>
                    <option value="ADMIN">Administrator</option>
                  </select>
                </div>
                <div className="col-12">
                  <label className="label-custom">Update Profile Avatar</label>
                  <input type="file" className="form-control" ref={fileInputRef} />
                </div>
              </div>

              <div className="section-divider">
                <span className="section-title">SECURITY CREDENTIALS</span>
              </div>

              <div className="row g-3">
                <div className="col-12">
                  <label className="label-custom">Current Password (Required for changes)</label>
                  <input type="password" className="form-control" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="••••••••" />
                </div>
                <div className="col-md-6">
                  <label className="label-custom">New Password</label>
                  <input type="password" className="form-control" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Leave blank to keep current" />
                </div>
                <div className="col-md-6">
                  <label className="label-custom">Verify New Password</label>
                  <input type="password" className="form-control" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                </div>
              </div>

              <div className="mt-5">
                <button type="submit" className="btn btn-lg w-100 fw-bold" style={{ backgroundColor: THEME.primary, color: '#000' }}>
                  Commit Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDetail;