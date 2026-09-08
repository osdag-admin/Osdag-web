import {
    STAFF,
    INTERNS,
    IITB_STUDENTS,
    ADVISORS,
    PM_STAFF,
  } from "../../constants/aboutOsdag/contributors";
  
  export default function ContributorsTab() {
    const renderList = (list) =>
      list.map((name, i) => (
        <li key={i} className="text-[13px] leading-tight">{name}</li>
      ));
  
    return (
      <div>
        <h3 className="mt-5 font-semibold">Project Investigator</h3>
        <p>Siddhartha Ghosh, IIT Bombay</p>
  
        <h3 className="mt-5 font-semibold">Project Research Staff</h3>
        <ul className="list-disc ml-5">{renderList(STAFF)}</ul>
  
        <h3 className="mt-5 font-semibold">Project Interns</h3>
        <ul className="list-disc ml-5">{renderList(INTERNS)}</ul>
  
        <h3 className="mt-5 font-semibold">IITB Students</h3>
        <ul className="list-disc ml-5">{renderList(IITB_STUDENTS)}</ul>
  
        <h3 className="mt-5 font-semibold">Advisors</h3>
        <ul className="list-disc ml-5">{renderList(ADVISORS)}</ul>
  
        <h3 className="mt-5 font-semibold">Project Management Staff</h3>
        <ul className="list-disc ml-5">{renderList(PM_STAFF)}</ul>
      </div>
    );
  }