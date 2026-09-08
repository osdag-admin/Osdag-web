import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useAuth } from "../../context/AuthContext";
import { apiClient } from "../../utils/apiClient";
import { AUTH, PROJECTS, MATERIALS, SECTIONS } from "../../datasources/endpoints";
import { MODULE_ROUTES } from "../../constants/modules";
import { getModuleRoute } from "../../constants/moduleRoutes";

/** ── DEBUG: catches render crashes in each section and logs which one ── */
class DebugErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error(
      `[MyDataPage] ❌ Crash in section: "${this.props.section}"`,
      "\nError:", error.message,
      "\nComponent stack:", info.componentStack
    );
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 16, background: '#fee', border: '1px solid red', borderRadius: 8, margin: 8 }}>
          <b>💥 Crash in: {this.props.section}</b>
          <pre style={{ fontSize: 11, marginTop: 8, whiteSpace: 'pre-wrap' }}>{this.state.error?.message}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const _BEAM_FIELDS = {
  dimensions: [
    { label: "Depth, D", key: "D" },
    { label: "Flange Width, B", key: "B" },
    { label: "Flange Thickness, T", key: "T" },
    { label: "Web Thickness, t", key: "tw" },
    { label: "Flange Slope, a", key: "FlangeSlope", unit: "deg." },
    { label: "Root Radius, R1", key: "R1" },
    { label: "Toe Radius, R2", key: "R2" },
  ],
  properties: {
    middle: [
      { label: "Mass, M", key: "Mass", unit: "Kg/m" },
      { label: "Sectional Area, a", key: "Area", unit: "cm²" },
      { label: "2nd Moment of Area, Iz", key: "Iz", unit: "cm⁴" },
      { label: "2nd Moment of Area, Iy", key: "Iy", unit: "cm⁴" },
      { label: "Radius of Gyration, rz", key: "rz", unit: "cm" },
      { label: "Radius of Gyration, ry", key: "ry", unit: "cm" },
      { label: "Elastic Modulus, Zz", key: "Zz", unit: "cm³" },
      { label: "Elastic Modulus, Zy", key: "Zy", unit: "cm³" },
    ],
    right: [
      { label: "Plastic Modulus, Zpz", key: "Zpz", unit: "cm³" },
      { label: "Plastic Modulus, Zpy", key: "Zpy", unit: "cm³" },
      { label: "Torsion Constant, It", key: "It", unit: "cm⁴" },
      { label: "Warping Constant, Iw", key: "Iw", unit: "cm⁶" },
    ],
  },
};

const SECTION_CONFIGS = {
  Beams: _BEAM_FIELDS,
  Columns: _BEAM_FIELDS,
  Angles: {
    dimensions: [
      { label: "Long Leg, A", key: "a" },
      { label: "Short Leg, B", key: "b" },
      { label: "Leg Thickness, t", key: "t" },
      { label: "Root Radius, R1", key: "R1" },
      { label: "Toe Radius, R2", key: "R2" },
    ],
    properties: {
      middle: [
        { label: "Mass, M", key: "Mass", unit: "Kg/m" },
        { label: "Sectional Area, a", key: "Area", unit: "cm²" },
        { label: "Cz", key: "Cz", unit: "cm" },
        { label: "Cy", key: "Cy", unit: "cm" },
        { label: "2nd Moment of Area, Iz", key: "Iz", unit: "cm⁴" },
        { label: "2nd Moment of Area, Iy", key: "Iy", unit: "cm⁴" },
        { label: "Radius of Gyration, rz", key: "rz", unit: "cm" },
        { label: "Radius of Gyration, ry", key: "ry", unit: "cm" },
      ],
      right: [
        { label: "Radius of Gyration, ru", key: "rumax", unit: "cm" },
        { label: "Radius of Gyration, rv", key: "rvmin", unit: "cm" },
        { label: "Elastic Modulus, Zz", key: "Zz", unit: "cm³" },
        { label: "Elastic Modulus, Zy", key: "Zy", unit: "cm³" },
        { label: "Plastic Modulus, Zpz", key: "Zpz", unit: "cm³" },
        { label: "Plastic Modulus, Zpy", key: "Zpy", unit: "cm³" },
        { label: "Torsion Constant, It", key: "It", unit: "cm⁴" },
      ],
    },
  },
  Channels: {
    dimensions: [
      { label: "Depth, D", key: "D" },
      { label: "Flange Width, B", key: "B" },
      { label: "Flange Thickness, T", key: "T" },
      { label: "Web Thickness, t", key: "tw" },
      { label: "Flange Slope, a", key: "FlangeSlope", unit: "deg." },
      { label: "Root Radius, R1", key: "R1" },
      { label: "Toe Radius, R2", key: "R2" },
    ],
    properties: {
      middle: [
        { label: "Mass, M", key: "Mass", unit: "Kg/m" },
        { label: "Sectional Area, a", key: "Area", unit: "cm²" },
        { label: "2nd Moment of Area, Iz", key: "Iz", unit: "cm⁴" },
        { label: "2nd Moment of Area, Iy", key: "Iy", unit: "cm⁴" },
        { label: "Radius of Gyration, rz", key: "rz", unit: "cm" },
        { label: "Radius of Gyration, ry", key: "ry", unit: "cm" },
        { label: "Elastic Modulus, Zz", key: "Zz", unit: "cm³" },
        { label: "Elastic Modulus, Zy", key: "Zy", unit: "cm³" },
        { label: "Cy", key: "Cy", unit: "cm" },
      ],
      right: [
        { label: "Plastic Modulus, Zpz", key: "Zpz", unit: "cm³" },
        { label: "Plastic Modulus, Zpy", key: "Zpy", unit: "cm³" },
        { label: "Torsion Constant, It", key: "It", unit: "cm⁴" },
        { label: "Warping Constant, Iw", key: "Iw", unit: "cm⁶" },
      ],
    },
  },
};

const MATERIAL_FIELDS = [
  { label: "Grade Name", key: "Grade", type: "text" },
  { label: "Yield Strength (< 20mm)", key: "Yield_Stress_less_than_20", suffix: " MPa", type: "number" },
  { label: "Yield Strength (20 - 40mm)", key: "Yield_Stress_between_20_and_neg40", suffix: " MPa", type: "number" },
  { label: "Yield Strength (> 40mm)", key: "Yield_Stress_greater_than_40", suffix: " MPa", type: "number" },
  { label: "Ultimate Tensile Strength", key: "Ultimate_Tensile_Stress", suffix: " MPa", type: "number" },
  { label: "Elongation", key: "Elongation", suffix: " %", type: "number" },
];

const getSectionFields = (tableName) => {
  const config = SECTION_CONFIGS[tableName];
  if (!config) return [];
  
  const fields = [];
  
  // Designation
  fields.push({ label: "Designation", key: "Designation", type: "text", category: "General" });
  
  // Dimensions
  if (config.dimensions) {
    config.dimensions.forEach(d => {
      fields.push({ label: d.label, key: d.key, type: "number", category: "Dimensions", unit: d.unit });
    });
  }
  
  // Properties (middle and right)
  if (config.properties) {
    if (config.properties.middle) {
      config.properties.middle.forEach(p => {
        fields.push({ label: p.label, key: p.key, type: "number", category: "Properties", unit: p.unit });
      });
    }
    if (config.properties.right) {
      config.properties.right.forEach(p => {
        fields.push({ label: p.label, key: p.key, type: "number", category: "Properties", unit: p.unit });
      });
    }
  }
  
  // Source and Type
  fields.push({ label: "Source", key: "Source", type: "text", category: "General" });
  fields.push({ label: "Type", key: "Type", type: "text", category: "General" });
  
  return fields;
};

const MyDataPage = () => {
  const [showSideBar, setShowSideBar] = useState(false);
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  // State for data
  const [projects, setProjects] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [activeTab, setActiveTab] = useState("projects");
  const [searchQuery, setSearchQuery] = useState("");

  // Rename Modal State
  const [renameModal, setRenameModal] = useState({
    isOpen: false,
    projectId: null,
    currentName: "",
    newName: "",
  });

  // Modal State
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    itemType: "", // "project" | "material" | "section"
    itemId: null,
    itemLabel: "",
    extraData: null, // used for section table designation
  });

  // View Details Modal State
  const [viewModal, setViewModal] = useState({
    isOpen: false,
    itemType: "", // "material" | "section"
    itemData: null,
  });

  // Edit Modal State
  const [editModal, setEditModal] = useState({
    isOpen: false,
    itemType: "", // "material" | "section"
    itemData: null,
    formData: {},
  });


  // Fetch all user data
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const response = await apiClient(AUTH.myData, { method: "GET" });
      const data = await response.json();
      if (data.success) {
        setProjects(data.projects || []);
        setMaterials(data.custom_materials || []);
        setSections(data.custom_sections || []);
      } else {
        toast.error("Failed to load your personal data");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while fetching your data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // GDPR data portability bulk export
  const handleBulkExport = async () => {
    try {
      const response = await apiClient(AUTH.exportData, { method: "GET" });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const userEmailStr = currentUser?.email || "user";
      a.download = `osdag_user_data_${userEmailStr.split("@")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("All data exported successfully");
    } catch (err) {
      console.error("Failed to export data:", err);
      toast.error("Failed to export your data. Please try again.");
    }
  };

  // Download project as .osi file
  const handleDownloadOsi = async (projectId, projectName) => {
    try {
      const response = await apiClient(`api/projects/${projectId}/osi`, { method: "GET" });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${projectName.replace(/ /g, "_")}.osi`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("OSI file downloaded successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to download OSI file");
    }
  };

  const handleOpenRename = (project) => {
    setRenameModal({
      isOpen: true,
      projectId: project.id,
      currentName: project.name,
      newName: project.name,
    });
  };

  const handleConfirmRename = async () => {
    const { projectId, newName, currentName } = renameModal;
    if (!newName.trim()) {
      toast.error("Project name cannot be empty");
      return;
    }
    if (newName.trim() === currentName) {
      setRenameModal({ isOpen: false, projectId: null, currentName: "", newName: "" });
      return;
    }

    try {
      const url = PROJECTS.detail(projectId);
      const response = await apiClient(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      
      const data = await response.json().catch(() => ({}));
      if (response.ok || data.success) {
        toast.success(`Project renamed successfully`);
        setProjects((prev) =>
          prev.map((p) => (p.id === projectId ? { ...p, name: newName.trim() } : p))
        );
        setRenameModal({ isOpen: false, projectId: null, currentName: "", newName: "" });
      } else {
        toast.error(data.error || data.message || "Failed to rename project");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during renaming");
    }
  };

  // Route to design page to open project
  const handleOpenProject = (project) => {
    const route = MODULE_ROUTES[project.routeKey] || getModuleRoute(project.submodule);
    if (route) {
      navigate(`${route}/${project.id}`);
    } else {
      toast.error("Design module route not found");
    }
  };

  // Triggers deletion warning modal
  const triggerDeleteConfirm = (itemType, itemId, itemLabel, extraData = null) => {
    setDeleteModal({
      isOpen: true,
      itemType,
      itemId,
      itemLabel,
      extraData,
    });
  };

  // Perform deletion after user confirmation
  const handleConfirmDelete = async () => {
    const { itemType, itemId, itemLabel, extraData } = deleteModal;
    setDeleteModal((prev) => ({ ...prev, isOpen: false }));

    try {
      if (itemType === "project") {
        const url = PROJECTS.detail(itemId);
        const response = await apiClient(url, { method: "DELETE" });
        const data = await response.json();
        if (data.success) {
          toast.success(`Project "${itemLabel}" deleted successfully`);
          setProjects((prev) => prev.filter((p) => p.id !== itemId));
        } else {
          toast.error(data.error || "Failed to delete project");
        }
      } else if (itemType === "material") {
        const url = MATERIALS.delete(itemId);
        const response = await apiClient(url, { method: "DELETE" });
        const data = await response.json();
        if (data.success) {
          toast.success(`Material "${itemLabel}" deleted successfully`);
          setMaterials((prev) => prev.filter((m) => m.id !== itemId));
        } else {
          toast.error(data.message || "Failed to delete material");
        }
      } else if (itemType === "section") {
        const url = `${SECTIONS.customDelete}?table=${extraData}&designation=${encodeURIComponent(itemLabel)}`;
        const response = await apiClient(url, { method: "DELETE" });
        if (response.status === 204) {
          toast.success(`Custom Section "${itemLabel}" deleted successfully`);
          setSections((prev) => prev.filter((s) => !(s.id === itemId && s.table === extraData)));
        } else {
          toast.error("Failed to delete custom section");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during deletion");
    }
  };

  const handleOpenViewMaterial = (mat) => {
    setViewModal({
      isOpen: true,
      itemType: "material",
      itemData: mat,
    });
  };

  const handleOpenEditMaterial = (mat) => {
    setEditModal({
      isOpen: true,
      itemType: "material",
      itemData: mat,
      formData: { ...mat },
    });
  };

  const handleOpenViewSection = (sec) => {
    setViewModal({
      isOpen: true,
      itemType: "section",
      itemData: sec,
    });
  };

  const handleOpenEditSection = (sec) => {
    setEditModal({
      isOpen: true,
      itemType: "section",
      itemData: sec,
      formData: { ...sec },
    });
  };

  const handleSaveEdit = async () => {
    const { itemType, itemData, formData } = editModal;
    
    if (itemType === "material") {
      if (!formData.Grade?.trim()) {
        toast.error("Grade Name is required");
        return;
      }
      
      const numericFields = [
        "Yield_Stress_less_than_20",
        "Yield_Stress_between_20_and_neg40",
        "Yield_Stress_greater_than_40",
        "Ultimate_Tensile_Stress",
        "Elongation",
      ];
      
      for (const field of numericFields) {
        if (formData[field] === undefined || formData[field] === "" || isNaN(Number(formData[field]))) {
          toast.error(`Please enter a valid number for ${field.replace(/_/g, " ")}`);
          return;
        }
      }
      
      const payload = {
        Grade: formData.Grade,
        Yield_Stress_less_than_20: Number(formData.Yield_Stress_less_than_20),
        Yield_Stress_between_20_and_neg40: Number(formData.Yield_Stress_between_20_and_neg40),
        Yield_Stress_greater_than_40: Number(formData.Yield_Stress_greater_than_40),
        Ultimate_Tensile_Stress: Number(formData.Ultimate_Tensile_Stress),
        Elongation: Number(formData.Elongation),
      };

      try {
        const url = `api/materialDetails/${itemData.id}/`;
        const response = await apiClient(url, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (data.success) {
          toast.success("Material updated successfully");
          setMaterials((prev) =>
            prev.map((m) => (m.id === itemData.id ? { ...m, ...payload } : m))
          );
          setEditModal({ isOpen: false, itemType: "", itemData: null, formData: {} });
        } else {
          toast.error(data.message || "Failed to update material");
        }
      } catch (err) {
        console.error(err);
        toast.error(err.message || "An error occurred while saving material");
      }
    } else if (itemType === "section") {
      if (!formData.Designation?.trim()) {
        toast.error("Designation is required");
        return;
      }
      
      const fields = getSectionFields(itemData.table);
      const payload = { id: itemData.id };
      
      for (const field of fields) {
        if (field.type === "number") {
          const val = formData[field.key];
          if (val === undefined || val === "" || val === null) {
            payload[field.key] = null;
          } else if (isNaN(Number(val))) {
            toast.error(`Please enter a valid number for ${field.label}`);
            return;
          } else {
            payload[field.key] = Number(val);
          }
        } else {
          const strVal = formData[field.key];
          const isEmpty = strVal === undefined || strVal === null || String(strVal).trim() === "";
          payload[field.key] = isEmpty
            ? (field.key === "Type" ? null : "")
            : String(strVal);
        }
      }

      try {
        const url = `${SECTIONS.customCreate}?table=${itemData.table}`;
        const response = await apiClient(url, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        toast.success("Custom Section updated successfully");
        setSections((prev) =>
          prev.map((s) => (s.id === itemData.id && s.table === itemData.table ? { ...s, ...payload } : s))
        );
        setEditModal({ isOpen: false, itemType: "", itemData: null, formData: {} });
      } catch (err) {
        console.error(err);
        toast.error(err.message || "An error occurred while saving custom section");
      }
    }
  };


  // Search filter logic
  const filteredProjects = projects.filter((p) =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.submodule?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMaterials = materials.filter((m) =>
    m.Grade?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSections = sections.filter((s) =>
    s.Designation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.table?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen antialiased w-full relative bg-white dark:bg-osdag-dark-color">
      <div className="flex lg:h-screen relative z-10">
        {/* Sidebar Overlay on Mobile */}
        {showSideBar && (
          <div className="fixed inset-0 z-40 flex">
            <button
              type="button"
              aria-label="Close sidebar"
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 cursor-pointer"
              onClick={() => setShowSideBar(false)}
            />
            <div className="relative flex-shrink-0 w-sidebar h-screen border-r border-osdag-border dark:border-gray-700 z-40">
              <DebugErrorBoundary section="Sidebar (mobile overlay)">
                <Sidebar setshowSideBar={setShowSideBar} />
              </DebugErrorBoundary>
            </div>
          </div>
        )}

        {/* Sidebar for desktop */}
        <div className="flex-shrink-0 bg-white dark:bg-osdag-dark-color hidden lg:block">
          <DebugErrorBoundary section="Sidebar (desktop)">
            <Sidebar setshowSideBar={setShowSideBar} active="Home" />
          </DebugErrorBoundary>
        </div>

        {/* Main Area */}
        <div className="relative flex-1 h-[100vh] flex flex-col min-w-0 overflow-hidden">
          {/* Backgrounds */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-[url('/images/background_light.svg')] bg-contain bg-right-bottom bg-no-repeat lg:bg-cover lg:bg-center dark:hidden"></div>
            <div className="absolute inset-0 bg-[url('/images/background_dark.svg')] bg-contain bg-right-bottom bg-no-repeat lg:bg-cover lg:bg-center hidden dark:block"></div>
          </div>

          <div className="relative flex-1 flex flex-col min-w-0 min-h-0">
            {/* Header */}
            <DebugErrorBoundary section="Header">
              <Header setshowSideBar={setShowSideBar} />
            </DebugErrorBoundary>

            {/* Scrollable Dashboard Body */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 max-w-7xl mx-auto w-full">
              {/* Back breadcrumb & Title */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <button
                    onClick={() => navigate("/home")}
                    className="flex items-center gap-1 text-sm font-medium text-osdag-green hover:underline mb-2 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Home
                  </button>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    My Personal Data
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Manage and review all your custom-saved engineering items and models.
                  </p>
                </div>

                <div>
                  <button
                    onClick={handleBulkExport}
                    className="flex items-center gap-2 px-4 py-2.5 bg-osdag-green hover:bg-osdag-green/90 dark:bg-osdag-dark-green text-white font-semibold rounded-xl shadow-md transition-all duration-200 transform active:scale-95"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export All Data (JSON)
                  </button>
                </div>
              </div>

              {/* Main Content Card (Glassmorphism layout) */}
              <div className="bg-white/70 dark:bg-gray-900/40 backdrop-blur-md border border-osdag-border dark:border-gray-800 rounded-3xl p-6 shadow-xl flex flex-col min-h-[500px]">
                {/* Search & Navigation Controls */}
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4 gap-4 mb-6">
                  {/* Tabs */}
                  <div className="flex border-b border-transparent">
                    <button
                      onClick={() => { setActiveTab("projects"); setSearchQuery(""); }}
                      className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all ${
                        activeTab === "projects"
                          ? "border-osdag-green text-osdag-green dark:text-osdag-green"
                          : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                      }`}
                    >
                      Saved Projects ({projects.length})
                    </button>
                    <button
                      onClick={() => { setActiveTab("materials"); setSearchQuery(""); }}
                      className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all ${
                        activeTab === "materials"
                          ? "border-osdag-green text-osdag-green dark:text-osdag-green"
                          : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                      }`}
                    >
                      Custom Materials ({materials.length})
                    </button>
                    <button
                      onClick={() => { setActiveTab("sections"); setSearchQuery(""); }}
                      className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all ${
                        activeTab === "sections"
                          ? "border-osdag-green text-osdag-green dark:text-osdag-green"
                          : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                      }`}
                    >
                      Custom Sections ({sections.length})
                    </button>
                  </div>

                  {/* Search Input */}
                  <div className="relative max-w-md w-full md:w-80">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      placeholder={`Search ${activeTab}...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-osdag-green text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Dashboard Loading or List Render */}
                {loading ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-20">
                    <div className="w-12 h-12 border-4 border-osdag-green border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-500 dark:text-gray-400 font-medium animate-pulse">
                      Retrieving your data configurations...
                    </p>
                  </div>
                ) : (
                  <div className="flex-1 overflow-x-auto">
                    {/* PROJECTS TAB */}
                    {activeTab === "projects" && (
                      <>
                        {filteredProjects.length === 0 ? (
                          <div className="text-center py-16">
                            <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            </svg>
                            <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300">No Projects Found</h3>
                            <p className="text-gray-400 text-sm mt-1">
                              {searchQuery ? "No matches for your search query." : "Save a project in any design module to see it listed here."}
                            </p>
                          </div>
                        ) : (
                          <table className="w-full text-left border-collapse min-w-[700px]">
                            <thead>
                              <tr className="border-b border-gray-200 dark:border-gray-800 text-xs font-semibold uppercase text-gray-400 tracking-wider">
                                <th className="pb-3 pr-4">Project Name</th>
                                <th className="pb-3 px-4">Design Type</th>
                                <th className="pb-3 px-4">Last Modified</th>
                                <th className="pb-3 pl-4 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50 text-sm">
                              {filteredProjects.map((project) => (
                                <tr key={project.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/10 transition-colors">
                                  <td className="py-4 pr-4 font-semibold text-gray-900 dark:text-white">
                                    {project.name}
                                  </td>
                                  <td className="py-4 px-4 text-gray-500 dark:text-gray-400">
                                    {project.submodule || project.module || "Unknown"}
                                  </td>
                                  <td className="py-4 px-4 text-gray-500 dark:text-gray-400">
                                    {formatDate(project.updated_at)}
                                  </td>
                                  <td className="py-4 pl-4 text-right flex items-center justify-end gap-2.5">
                                    <button
                                      onClick={() => handleOpenProject(project)}
                                      className="px-3 py-1.5 text-xs font-semibold bg-osdag-green/10 hover:bg-osdag-green text-osdag-green hover:text-white rounded-lg transition-all"
                                    >
                                      Open
                                    </button>
                                    <button
                                      onClick={() => handleDownloadOsi(project.id, project.name)}
                                      className="px-3 py-1.5 text-xs font-semibold border border-gray-300 hover:border-osdag-green dark:border-gray-700 text-gray-700 dark:text-gray-300 dark:hover:text-white rounded-lg transition-all"
                                    >
                                      OSI
                                    </button>
                                    <button
                                      onClick={() => handleOpenRename(project)}
                                      className="px-3 py-1.5 text-xs font-semibold border border-gray-300 hover:border-blue-500 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 rounded-lg transition-all"
                                    >
                                      Rename
                                    </button>
                                    <button
                                      onClick={() => triggerDeleteConfirm("project", project.id, project.name)}
                                      className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all"
                                      title="Delete Project"
                                    >
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </>
                    )}

                    {/* MATERIALS TAB */}
                    {activeTab === "materials" && (
                      <>
                        {filteredMaterials.length === 0 ? (
                          <div className="text-center py-16">
                            <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 11.262 1.304l-.041.02a.75.75 0 01-.262-1.304zM11.25 15.25l.041-.02a.75.75 0 11.262 1.304l-.041.02a.75.75 0 01-.262-1.304zM12 21.75a9.75 9.75 0 100-19.5 9.75 9.75 0 000 19.5z" />
                            </svg>
                            <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300">No Custom Materials</h3>
                            <p className="text-gray-400 text-sm mt-1">
                              {searchQuery ? "No matching materials found." : "Add a custom steel material in your design configuration to see it here."}
                            </p>
                          </div>
                        ) : (
                          <table className="w-full text-left border-collapse min-w-[700px]">
                            <thead>
                              <tr className="border-b border-gray-200 dark:border-gray-800 text-xs font-semibold uppercase text-gray-400 tracking-wider">
                                <th className="pb-3 pr-4">Grade Name</th>
                                <th className="pb-3 px-4">Yield strength (&lt;20mm)</th>
                                <th className="pb-3 px-4">Yield strength (20-40mm)</th>
                                <th className="pb-3 px-4">Yield strength (&gt;40mm)</th>
                                <th className="pb-3 px-4">Tensile fu (MPa)</th>
                                <th className="pb-3 px-4">Elongation (%)</th>
                                <th className="pb-3 pl-4 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50 text-sm">
                              {filteredMaterials.map((mat) => (
                                <tr key={mat.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/10 transition-colors">
                                  <td className="py-4 pr-4 font-semibold text-gray-900 dark:text-white">
                                    {mat.Grade}
                                  </td>
                                  <td className="py-4 px-4 text-gray-500 dark:text-gray-400">{mat.Yield_Stress_less_than_20} MPa</td>
                                  <td className="py-4 px-4 text-gray-500 dark:text-gray-400">{mat.Yield_Stress_between_20_and_neg40} MPa</td>
                                  <td className="py-4 px-4 text-gray-500 dark:text-gray-400">{mat.Yield_Stress_greater_than_40} MPa</td>
                                  <td className="py-4 px-4 text-gray-500 dark:text-gray-400">{mat.Ultimate_Tensile_Stress} MPa</td>
                                  <td className="py-4 px-4 text-gray-500 dark:text-gray-400">{mat.Elongation}%</td>
                                  <td className="py-4 pl-4 text-right flex items-center justify-end gap-2">
                                    <button
                                      onClick={() => handleOpenViewMaterial(mat)}
                                      className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-lg transition-all"
                                      title="View Details"
                                    >
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                      </svg>
                                    </button>
                                    {/* Edit Material button — temporarily disabled
                                    <button
                                      onClick={() => handleOpenEditMaterial(mat)}
                                      className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 rounded-lg transition-all"
                                      title="Edit Material"
                                    >
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                      </svg>
                                    </button>
                                    */}
                                    <button
                                      onClick={() => triggerDeleteConfirm("material", mat.id, mat.Grade)}
                                      className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all"
                                      title="Delete Material"
                                    >
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </>
                    )}

                    {/* SECTIONS TAB */}
                    {activeTab === "sections" && (
                      <>
                        {filteredSections.length === 0 ? (
                          <div className="text-center py-16">
                            <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                            </svg>
                            <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300">No Custom Sections</h3>
                            <p className="text-gray-400 text-sm mt-1">
                              {searchQuery ? "No matching custom sections found." : "Import custom sections (e.g., Beams, Columns) to see them listed here."}
                            </p>
                          </div>
                        ) : (
                          <table className="w-full text-left border-collapse min-w-[700px]">
                            <thead>
                              <tr className="border-b border-gray-200 dark:border-gray-800 text-xs font-semibold uppercase text-gray-400 tracking-wider">
                                <th className="pb-3 pr-4">Designation</th>
                                <th className="pb-3 px-4">Section Type</th>
                                <th className="pb-3 px-4">Added On</th>
                                <th className="pb-3 pl-4 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50 text-sm">
                              {filteredSections.map((sec) => (
                                <tr key={`${sec.table}-${sec.id}`} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/10 transition-colors">
                                  <td className="py-4 pr-4 font-semibold text-gray-900 dark:text-white">
                                    {sec.Designation}
                                  </td>
                                  <td className="py-4 px-4 text-gray-500 dark:text-gray-400">
                                    {sec.table}
                                  </td>
                                  <td className="py-4 px-4 text-gray-500 dark:text-gray-400">
                                    {formatDate(sec.created_at)}
                                  </td>
                                  <td className="py-4 pl-4 text-right flex items-center justify-end gap-2">
                                    <button
                                      onClick={() => handleOpenViewSection(sec)}
                                      className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-lg transition-all"
                                      title="View Details"
                                    >
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                      </svg>
                                    </button>
                                    {/* Edit Section button — temporarily disabled
                                    <button
                                      onClick={() => handleOpenEditSection(sec)}
                                      className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 rounded-lg transition-all"
                                      title="Edit Custom Section"
                                    >
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                      </svg>
                                    </button>
                                    */}
                                    <button
                                      onClick={() => triggerDeleteConfirm("section", sec.id, sec.Designation, sec.table)}
                                      className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all"
                                      title="Delete Custom Section"
                                    >
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rename Project Modal */}
      <DebugErrorBoundary section="Rename Project Modal">
      {renameModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
          <div className="relative w-full max-w-md bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-2xl overflow-hidden transform scale-100 transition-all duration-300">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Rename Project
            </h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 block">
                  Project Name
                </label>
                <input
                  type="text"
                  value={renameModal.newName}
                  onChange={(e) => setRenameModal(prev => ({ ...prev, newName: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleConfirmRename();
                    }
                  }}
                  autoFocus
                  className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-750 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-osdag-green text-gray-900 dark:text-white transition-all"
                  placeholder="Enter new project name"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setRenameModal({ isOpen: false, projectId: null, currentName: "", newName: "" })}
                className="flex-1 py-2.5 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900/50 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRename}
                className="flex-1 py-2.5 bg-osdag-green hover:bg-osdag-green/90 text-white rounded-xl text-sm font-semibold transition-all shadow-md active:scale-95"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      </DebugErrorBoundary>

      {/* Styled Confirmation Warning Modal */}
      <DebugErrorBoundary section="Delete Confirm Modal">
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
          <div className="relative w-full max-w-md bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-2xl overflow-hidden transform scale-100 transition-all duration-300">
            {/* Warning indicator */}
            <div className="w-12 h-12 bg-red-100 dark:bg-red-950/40 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 mb-4 mx-auto">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h3 className="text-lg font-bold text-center text-gray-900 dark:text-white mb-2">
              Delete {deleteModal.itemType === "section" ? "Custom Section" : deleteModal.itemType === "material" ? "Custom Material" : "Project"}?
            </h3>
            
            <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-6 px-2">
              Are you sure you want to permanently delete <strong className="text-gray-900 dark:text-white font-semibold">"{deleteModal.itemLabel}"</strong>? This action cannot be undone and the item will be deleted permanently.
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteModal({ isOpen: false, itemType: "", itemId: null, itemLabel: "", extraData: null })}
                className="flex-1 py-2.5 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900/50 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md active:scale-95"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
      </DebugErrorBoundary>

      {/* View Details Modal */}
      <DebugErrorBoundary section="View Details Modal">
      {viewModal.isOpen && viewModal.itemData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
          <div className="relative w-full max-w-2xl bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-4 border-b border-gray-150 dark:border-gray-800 mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {viewModal.itemType === "material" ? "Custom Material Details" : `Custom ${viewModal.itemData.table.slice(0, -1)} Details`}
              </h3>
              <button
                type="button"
                onClick={() => setViewModal({ isOpen: false, itemType: "", itemData: null })}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              {viewModal.itemType === "material" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {MATERIAL_FIELDS.map((field) => (
                    <div key={field.key} className="bg-gray-50 dark:bg-gray-900/60 p-4 rounded-2xl border border-gray-100 dark:border-gray-800/40">
                      <div className="text-xs text-gray-400 font-semibold uppercase">{field.label}</div>
                      <div className="text-base font-bold text-gray-800 dark:text-gray-200 mt-1">
                        {viewModal.itemData[field.key]}
                        <span className="text-sm font-medium text-gray-400 dark:text-gray-500 ml-0.5">{field.suffix || ""}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Group fields by category */}
                  {["General", "Dimensions", "Properties"].map((category) => {
                    const fields = getSectionFields(viewModal.itemData.table).filter(f => f.category === category);
                    if (fields.length === 0) return null;
                    return (
                      <div key={category} className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-osdag-green dark:text-osdag-green/90 px-1">
                          {category}
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {fields.map((field) => (
                            <div key={field.key} className="bg-gray-50/50 dark:bg-gray-900/40 p-3 rounded-xl border border-gray-100 dark:border-gray-800/40">
                              <div className="text-xs text-gray-400 font-medium truncate" title={field.label}>
                                {field.label}
                              </div>
                              <div className="text-sm font-bold text-gray-800 dark:text-gray-200 mt-0.5">
                                {viewModal.itemData[field.key] !== null && viewModal.itemData[field.key] !== undefined
                                  ? String(viewModal.itemData[field.key])
                                  : "N/A"}
                                <span className="text-xs font-normal text-gray-400 dark:text-gray-500 ml-0.5">
                                  {field.unit ? ` ${field.unit}` : ""}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end pt-4 border-t border-gray-150 dark:border-gray-800 mt-4">
              <button
                type="button"
                onClick={() => setViewModal({ isOpen: false, itemType: "", itemData: null })}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-900 dark:hover:bg-gray-850 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 transition-all active:scale-95"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      </DebugErrorBoundary>

      {/* Edit Properties Modal */}
      <DebugErrorBoundary section="Edit Properties Modal">
      {editModal.isOpen && editModal.itemData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
          <div className="relative w-full max-w-3xl bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-4 border-b border-gray-150 dark:border-gray-800 mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {editModal.itemType === "material" ? "Edit Custom Material" : `Edit Custom ${editModal.itemData.table.slice(0, -1)}`}
              </h3>
              <button
                type="button"
                onClick={() => setEditModal({ isOpen: false, itemType: "", itemData: null, formData: {} })}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-5">
              {editModal.itemType === "material" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {MATERIAL_FIELDS.map((field) => (
                    <div key={field.key} className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {field.label} {field.suffix ? `(${field.suffix.trim()})` : ""}
                      </label>
                      <input
                        type={field.type}
                        value={editModal.formData[field.key] ?? ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditModal(prev => ({
                            ...prev,
                            formData: {
                              ...prev.formData,
                              [field.key]: val
                            }
                          }));
                        }}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-750 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-osdag-green text-gray-900 dark:text-white transition-all"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Group fields by category */}
                  {["General", "Dimensions", "Properties"].map((category) => {
                    const fields = getSectionFields(editModal.itemData.table).filter(f => f.category === category);
                    if (fields.length === 0) return null;
                    return (
                      <div key={category} className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-osdag-green dark:text-osdag-green/90 px-1">
                          {category}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {fields.map((field) => (
                            <div key={field.key} className="space-y-1">
                              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wide truncate block" title={field.label}>
                                {field.label} {field.unit ? `(${field.unit})` : ""}
                              </label>
                              <input
                                type={field.type}
                                value={editModal.formData[field.key] ?? ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setEditModal(prev => ({
                                    ...prev,
                                    formData: {
                                      ...prev.formData,
                                      [field.key]: val
                                    }
                                  }));
                                }}
                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-750 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-osdag-green text-gray-900 dark:text-white transition-all"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-150 dark:border-gray-800 mt-4">
              <button
                type="button"
                onClick={() => setEditModal({ isOpen: false, itemType: "", itemData: null, formData: {} })}
                className="px-5 py-2.5 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900/50 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-5 py-2.5 bg-osdag-green hover:bg-osdag-green/90 dark:bg-osdag-dark-green text-white rounded-xl text-sm font-semibold transition-all shadow-md active:scale-95"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      </DebugErrorBoundary>
    </div>
  );
};

export default MyDataPage;