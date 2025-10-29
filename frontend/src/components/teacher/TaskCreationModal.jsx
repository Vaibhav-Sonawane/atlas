import { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";
import toast from "react-hot-toast";

function TaskCreationModal({ onCancel }) {
  const [students, setStudents] = useState([]);
  const [assignedTo, setAssignedTo] = useState([]);

  // Task form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [category, setCategory] = useState("MERN");
  const [difficulty, setDifficulty] = useState("medium");
  const [points, setPoints] = useState(10);
  const [dueDate, setDueDate] = useState("");
  const [submissionType, setSubmissionType] = useState("both");

  // Fetch students
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/tasks/students", 
        {headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }})
      .then((res) => {
        const options = res.data.map((student) => ({
          value: student._id,
          label: `${student.firstName} ${student.lastName} (${student.email})`,
        }));
        setStudents(options);
      })
      .catch((err) => console.error("Failed to fetch students", err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const taskData = {
        title,
        description,
        instructions,
        category,
        difficulty,
        points,
        dueDate,
        assignedTo: assignedTo.map((s) => s.value),
        submissionType,
      };

      await axios.post("http://localhost:5000/api/tasks", 
        taskData,
        {headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }});
      toast.success("Task created successfully!");
      onCancel();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create task");
    }
  };

  return (
    <>
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl p-6 max-h-[90vh] overflow-y-auto flex flex-col md:flex-row gap-6">
      
        {/* Left Section - Task Info */}
        <div className="flex-1 space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Task Information</h2>
      
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
      
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 h-28 md:h-24 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            />
          </div>
      
          {/* Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 h-28 md:h-24 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            />
          </div>
      
          {/* Category & Difficulty Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option>MERN</option>
                <option>HTML/CSS/JS</option>
                <option>Python</option>
                <option>Java</option>
                <option>SQL</option>
                <option>MongoDB</option>
                <option>React.js</option>
                <option>Express.js/Node.js</option>
                <option>C</option>
                <option>C++</option>
                <option>Others</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
      
          {/* Points & Due Date Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
              <input
                type="number"
                value={points}
                min="1"
                max="100"
                onChange={(e) => setPoints(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>
      
        {/* Right Section - Assignment & Actions */}
        <div className="flex-1 space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Assignment</h2>
      
          {/* Assign Students */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assign To Students</label>
            <Select
              isMulti
              options={students}
              value={assignedTo}
              onChange={setAssignedTo}
              placeholder="Select students..."
              className="react-select-container"
              classNamePrefix="react-select"
            />
          </div>

          {/* Submission Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Submission Type</label>
            <select value={submissionType} onChange={(e) => setSubmissionType(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="both">Both</option>
              <option value="file">File Only</option>
              <option value="text">Text Only</option>
            </select>
          </div>
      
          {/* Actions */}
          <div className="flex flex-col md:flex-row justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 w-full md:w-auto"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 w-full md:w-auto"
            >
              Create Task
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default TaskCreationModal;