/*

import TravelApprovals from "@/components/TravelApprovals";
import ExperienceApprovals from "@/components/ExperienceApprovals";
import UserRecords from "@/components/UserRecords";
import ExperienceRecords from "@/components/ExperienceRecords";
import HelpChat from "@/components/HelpChat";



    
         
          <Route path="/travel-approvals" element={<TravelApprovals />} />
          <Route path="/experience-approvals" element={<ExperienceApprovals />} />
          <Route path="/user-records" element={<UserRecords />} />
          <Route path="/experience-records" element={<ExperienceRecords />} />
          <Route path="/help-chat" element={<HelpChat />} />
        </Routes>
    


*/

import { Routes, Route } from "react-router-dom";
import Sidebar from "@/components/SideBar";
import Dashboard from "@/components/Dashboard";
import CandidatesDashboard from "@/components/CandidatesDashboard";
import ExperiencesAnalysisDashboard from "@/components/ExperiencesAnalysisDashboard";


const Hause = () => {
  return (
<div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Routes>
           <Route path="/" element={<Dashboard />} />
          <Route path="/CandidatesDashboard" element={<CandidatesDashboard />} />
            <Route path="experience-approvals" element={<ExperiencesAnalysisDashboard />} />
       


        </Routes>
  </div>
    </div>



  );
};
export default Hause;