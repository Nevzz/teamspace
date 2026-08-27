import type { AppData } from '../types';

const now = new Date();
const iso = (daysOffset = 0) => {
  const d = new Date(now);
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString();
};

export const mockData: AppData = {
  team: [
    { id: 'mem-1', name: 'Alex Chen', email: 'alex@team.edu', role: 'Team Lead', avatarColor: '#0A84FF', createdAt: iso(-60) },
    { id: 'mem-2', name: 'Nevin Roy', email: 'nevin@team.edu', role: 'Analyst', avatarColor: '#30D158', createdAt: iso(-60) },
    { id: 'mem-3', name: 'Priya Nair', email: 'priya@team.edu', role: 'Researcher', avatarColor: '#FF9F0A', createdAt: iso(-60) },
    { id: 'mem-4', name: 'Marcus Lee', email: 'marcus@team.edu', role: 'Designer', avatarColor: '#BF5AF2', createdAt: iso(-60) },
    { id: 'mem-5', name: 'Sara Ahmed', email: 'sara@team.edu', role: 'Writer', avatarColor: '#FF453A', createdAt: iso(-60) },
    { id: 'mem-6', name: 'Devika Rao', email: 'devika@team.edu', role: 'Coordinator', avatarColor: '#8E8E93', createdAt: iso(-60) },
  ],
  subjects: [
    { id: 'sub-1', name: 'Strategic Management', code: 'MGT501', professor: 'Dr. Sharma', description: 'Corporate strategy, competitive analysis, and market positioning.', trimester: 'Trimester 3', schedule: 'Mon / Wed · 9:00 AM', createdAt: iso(-60), updatedAt: iso(-1) },
    { id: 'sub-2', name: 'Business Analytics', code: 'BAN410', professor: 'Dr. Kapoor', description: 'Applied statistics and data-driven decision making.', trimester: 'Trimester 3', schedule: 'Tue / Thu · 11:00 AM', createdAt: iso(-60), updatedAt: iso(-2) },
    { id: 'sub-3', name: 'Technology Consulting', code: 'TEC330', professor: 'Prof. Whitfield', description: 'Digital transformation and enterprise technology strategy.', trimester: 'Trimester 3', schedule: 'Wed / Fri · 2:00 PM', createdAt: iso(-60), updatedAt: iso(-4) },
    { id: 'sub-4', name: 'Financial Modeling', code: 'FIN420', professor: 'Dr. Alvarez', description: 'Valuation, forecasting, and financial statement modeling.', trimester: 'Trimester 3', schedule: 'Mon / Thu · 3:30 PM', createdAt: iso(-60), updatedAt: iso(-3) },
  ],
  projects: [
    { id: 'proj-1', projectName: 'Market Entry Analysis', subjectId: 'sub-1', course: 'Strategic Management', description: 'Evaluate entry strategy for a Southeast Asian market.', objective: 'Deliver a go-to-market recommendation backed by market sizing and competitive analysis.', status: 'in-progress', priority: 'high', startDate: iso(-14), deadline: iso(6), professor: 'Dr. Sharma', presentationDate: iso(8), submissionRequirements: '20-page report + slide deck', submissionLink: '', driveLink: 'https://drive.google.com', createdAt: iso(-14), updatedAt: iso(-1) },
    { id: 'proj-2', projectName: 'Customer Churn Case Study', subjectId: 'sub-2', course: 'Business Analytics', description: 'Predictive model for subscription churn.', objective: 'Build and present a churn-reduction strategy using cohort analysis.', status: 'in-progress', priority: 'medium', startDate: iso(-10), deadline: iso(1), professor: 'Dr. Kapoor', presentationDate: iso(3), submissionRequirements: 'Jupyter notebook + memo', submissionLink: '', driveLink: '', createdAt: iso(-10), updatedAt: iso(-1) },
    { id: 'proj-3', projectName: 'Digital Transformation Roadmap', subjectId: 'sub-3', course: 'Technology Consulting', description: 'Roadmap for a legacy retailer moving to cloud-native operations.', objective: 'Present a phased 18-month transformation plan.', status: 'not-started', priority: 'medium', startDate: iso(2), deadline: iso(18), professor: 'Prof. Whitfield', presentationDate: iso(20), submissionRequirements: 'Slide deck', submissionLink: '', driveLink: '', createdAt: iso(-2), updatedAt: iso(-2) },
    { id: 'proj-4', projectName: 'DCF Valuation Project', subjectId: 'sub-4', course: 'Financial Modeling', description: 'Full DCF valuation of a publicly traded company.', objective: 'Build a 3-statement model and defend an investment thesis.', status: 'at-risk', priority: 'high', startDate: iso(-20), deadline: iso(-1), professor: 'Dr. Alvarez', presentationDate: iso(2), submissionRequirements: 'Excel model + 1-pager', submissionLink: '', driveLink: '', createdAt: iso(-20), updatedAt: iso(-1) },
  ],
  tasks: [
    { id: 'task-1', projectId: 'proj-1', taskName: 'Finalize market sizing', description: 'TAM/SAM/SOM for target region', assigneeId: 'mem-1', status: 'in-progress', priority: 'high', dueDate: iso(0), notes: '', createdAt: iso(-5), updatedAt: iso(-1) },
    { id: 'task-2', projectId: 'proj-1', taskName: 'Complete competitor analysis', description: 'Profile top 5 competitors', assigneeId: 'mem-1', status: 'todo', priority: 'medium', dueDate: iso(4), notes: '', createdAt: iso(-5), updatedAt: iso(-5) },
    { id: 'task-3', projectId: 'proj-1', taskName: 'Draft entry strategy slide', description: '', assigneeId: 'mem-4', status: 'todo', priority: 'medium', dueDate: iso(5), notes: '', createdAt: iso(-4), updatedAt: iso(-4) },
    { id: 'task-4', projectId: 'proj-1', taskName: 'Review regulatory risks', description: '', assigneeId: 'mem-3', status: 'review', priority: 'low', dueDate: iso(3), notes: '', createdAt: iso(-6), updatedAt: iso(-1) },
    { id: 'task-5', projectId: 'proj-2', taskName: 'Submit case analysis', description: '', assigneeId: 'mem-2', status: 'in-progress', priority: 'high', dueDate: iso(1), notes: '', createdAt: iso(-3), updatedAt: iso(-1) },
    { id: 'task-6', projectId: 'proj-2', taskName: 'Clean churn dataset', description: '', assigneeId: 'mem-2', status: 'done', priority: 'medium', dueDate: iso(-2), notes: '', createdAt: iso(-8), updatedAt: iso(-2) },
    { id: 'task-7', projectId: 'proj-2', taskName: 'Build cohort visualization', description: '', assigneeId: 'mem-3', status: 'review', priority: 'medium', dueDate: iso(0), notes: '', createdAt: iso(-5), updatedAt: iso(0) },
    { id: 'task-8', projectId: 'proj-3', taskName: 'Group presentation', description: 'Kickoff presentation to stakeholders', assigneeId: 'mem-6', status: 'todo', priority: 'high', dueDate: iso(2), notes: '', createdAt: iso(-1), updatedAt: iso(-1) },
    { id: 'task-9', projectId: 'proj-3', taskName: 'Audit current tech stack', description: '', assigneeId: 'mem-5', status: 'todo', priority: 'medium', dueDate: iso(6), notes: '', createdAt: iso(-1), updatedAt: iso(-1) },
    { id: 'task-10', projectId: 'proj-4', taskName: 'Build revenue projections', description: '', assigneeId: 'mem-1', status: 'in-progress', priority: 'high', dueDate: iso(-1), notes: 'Blocked on updated guidance', createdAt: iso(-15), updatedAt: iso(-1) },
    { id: 'task-11', projectId: 'proj-4', taskName: 'WACC sensitivity table', description: '', assigneeId: 'mem-4', status: 'todo', priority: 'medium', dueDate: iso(1), notes: '', createdAt: iso(-10), updatedAt: iso(-10) },
    { id: 'task-12', projectId: 'proj-4', taskName: 'Peer comps benchmarking', description: '', assigneeId: 'mem-5', status: 'done', priority: 'low', dueDate: iso(-5), notes: '', createdAt: iso(-18), updatedAt: iso(-5) },
    { id: 'task-13', projectId: 'proj-1', taskName: 'Interview local distributor contact', description: '', assigneeId: 'mem-6', status: 'done', priority: 'low', dueDate: iso(-3), notes: '', createdAt: iso(-9), updatedAt: iso(-3) },
    { id: 'task-14', projectId: 'proj-2', taskName: 'Present findings to class', description: '', assigneeId: 'mem-2', status: 'todo', priority: 'high', dueDate: iso(3), notes: '', createdAt: iso(-2), updatedAt: iso(-2) },
    { id: 'task-15', projectId: 'proj-3', taskName: 'Vendor shortlist', description: '', assigneeId: 'mem-3', status: 'todo', priority: 'low', dueDate: iso(10), notes: '', createdAt: iso(-1), updatedAt: iso(-1) },
    { id: 'task-16', projectId: 'proj-4', taskName: 'Finalize investment memo', description: '', assigneeId: 'mem-1', status: 'review', priority: 'high', dueDate: iso(1), notes: '', createdAt: iso(-6), updatedAt: iso(0) },
    { id: 'task-17', projectId: 'proj-1', taskName: 'Executive summary draft', description: '', assigneeId: 'mem-5', status: 'in-progress', priority: 'medium', dueDate: iso(2), notes: '', createdAt: iso(-4), updatedAt: iso(-1) },
    { id: 'task-18', projectId: 'proj-2', taskName: 'Peer review notebook', description: '', assigneeId: 'mem-4', status: 'todo', priority: 'low', dueDate: iso(2), notes: '', createdAt: iso(-2), updatedAt: iso(-2) },
  ],
  milestones: [
    { id: 'mile-1', projectId: 'proj-1', title: 'Group presentation', date: iso(8), type: 'presentation', notes: '', createdAt: iso(-14) },
    { id: 'mile-2', projectId: 'proj-4', title: 'Investment committee review', date: iso(2), type: 'meeting', notes: '', createdAt: iso(-20) },
  ],
  resources: [
    { id: 'res-1', projectId: 'proj-1', name: 'Market Research Database', url: 'https://drive.google.com', type: 'Google Drive', addedBy: 'mem-3', createdAt: iso(-10) },
    { id: 'res-2', projectId: 'proj-4', name: 'DCF Template', url: 'https://docs.google.com', type: 'Google Docs', addedBy: 'mem-1', createdAt: iso(-15) },
  ],
  notes: [
    { id: 'pnote-1', projectId: 'proj-1', title: 'Kickoff meeting notes', content: 'Aligned on scope and timeline with the professor.', authorId: 'mem-1', createdAt: iso(-14), updatedAt: iso(-14) },
  ],
  calendar: [
    { id: 'cal-1', title: 'Finalize market analysis', date: iso(0), type: 'deadline', linkedType: 'task', linkedId: 'task-1', createdAt: iso(-5) },
    { id: 'cal-2', title: 'Submit case analysis', date: iso(1), type: 'deadline', linkedType: 'task', linkedId: 'task-5', createdAt: iso(-3) },
    { id: 'cal-3', title: 'Group presentation', date: iso(8), type: 'presentation', linkedType: 'project', linkedId: 'proj-1', createdAt: iso(-14) },
    { id: 'cal-4', title: 'Investment committee review', date: iso(2), type: 'meeting', linkedType: 'project', linkedId: 'proj-4', createdAt: iso(-20) },
  ],
  subjectNotes: [
    { id: 'snote-1', subjectId: 'sub-1', title: "Porter's Five Forces", topic: 'Competitive Strategy', content: 'Framework for analyzing industry competitiveness: threat of new entrants, bargaining power of suppliers, bargaining power of buyers, threat of substitutes, and competitive rivalry.', authorId: 'mem-2', createdAt: iso(-8), updatedAt: iso(0) },
    { id: 'snote-2', subjectId: 'sub-1', title: 'Blue Ocean Strategy', topic: 'Strategy Frameworks', content: 'Creating uncontested market space rather than competing in existing industries — value innovation over competition.', authorId: 'mem-5', createdAt: iso(-6), updatedAt: iso(-1) },
    { id: 'snote-3', subjectId: 'sub-2', title: 'Regression Diagnostics', topic: 'Statistical Modeling', content: 'Checklist for validating linear regression assumptions: linearity, independence, homoscedasticity, normality of residuals.', authorId: 'mem-3', createdAt: iso(-5), updatedAt: iso(-2) },
    { id: 'snote-4', subjectId: 'sub-3', title: 'Cloud Migration Patterns', topic: 'Enterprise Architecture', content: 'Common migration strategies: rehost, replatform, refactor, repurchase, retire, retain.', authorId: 'mem-6', createdAt: iso(-3), updatedAt: iso(-3) },
    { id: 'snote-5', subjectId: 'sub-4', title: 'WACC Calculation', topic: 'Valuation', content: 'Weighted average cost of capital blends the cost of equity and after-tax cost of debt, weighted by capital structure.', authorId: 'mem-1', createdAt: iso(-10), updatedAt: iso(-4) },
    { id: 'snote-6', subjectId: 'sub-1', title: 'SWOT in Practice', topic: 'Strategy Frameworks', content: 'Notes from the Sharma lecture on applying SWOT alongside PESTEL for a fuller external view.', authorId: 'mem-4', createdAt: iso(-4), updatedAt: iso(-4) },
    { id: 'snote-7', subjectId: 'sub-2', title: 'A/B Testing Pitfalls', topic: 'Experimentation', content: 'Common mistakes: peeking early, ignoring novelty effects, underpowered sample sizes.', authorId: 'mem-2', createdAt: iso(-2), updatedAt: iso(-2) },
    { id: 'snote-8', subjectId: 'sub-4', title: 'Terminal Value Methods', topic: 'Valuation', content: 'Gordon growth vs. exit multiple approaches, and when each is more defensible.', authorId: 'mem-5', createdAt: iso(-7), updatedAt: iso(-6) },
    { id: 'snote-9', subjectId: 'sub-3', title: 'Vendor Evaluation Criteria', topic: 'Procurement', content: 'Scoring rubric covering cost, scalability, security posture, and integration effort.', authorId: 'mem-3', createdAt: iso(-1), updatedAt: iso(-1) },
    { id: 'snote-10', subjectId: 'sub-1', title: 'Value Chain Mapping', topic: 'Strategy Frameworks', content: "Primary vs. support activities in Porter's value chain, applied to our market entry case.", authorId: 'mem-6', createdAt: iso(-1), updatedAt: iso(0) },
  ],
  subjectTopics: [
    { id: 'stopic-1', subjectId: 'sub-1', topic: "Porter's Five Forces", status: 'complete', priority: 'high', notes: '', createdAt: iso(-30), updatedAt: iso(-8) },
    { id: 'stopic-2', subjectId: 'sub-1', topic: 'SWOT Analysis', status: 'complete', priority: 'medium', notes: '', createdAt: iso(-30), updatedAt: iso(-6) },
    { id: 'stopic-3', subjectId: 'sub-1', topic: 'Blue Ocean Strategy', status: 'pending', priority: 'medium', notes: '', createdAt: iso(-30), updatedAt: iso(-30) },
    { id: 'stopic-4', subjectId: 'sub-1', topic: 'Value Chain Analysis', status: 'pending', priority: 'low', notes: '', createdAt: iso(-30), updatedAt: iso(-30) },
    { id: 'stopic-5', subjectId: 'sub-2', topic: 'Regression Analysis', status: 'complete', priority: 'high', notes: '', createdAt: iso(-30), updatedAt: iso(-5) },
    { id: 'stopic-6', subjectId: 'sub-2', topic: 'Hypothesis Testing', status: 'pending', priority: 'medium', notes: '', createdAt: iso(-30), updatedAt: iso(-30) },
    { id: 'stopic-7', subjectId: 'sub-3', topic: 'Cloud Architecture', status: 'complete', priority: 'high', notes: '', createdAt: iso(-30), updatedAt: iso(-3) },
    { id: 'stopic-8', subjectId: 'sub-3', topic: 'Agile Delivery', status: 'pending', priority: 'low', notes: '', createdAt: iso(-30), updatedAt: iso(-30) },
    { id: 'stopic-9', subjectId: 'sub-4', topic: 'DCF Modeling', status: 'complete', priority: 'high', notes: '', createdAt: iso(-30), updatedAt: iso(-10) },
    { id: 'stopic-10', subjectId: 'sub-4', topic: 'Comparable Company Analysis', status: 'pending', priority: 'medium', notes: '', createdAt: iso(-30), updatedAt: iso(-30) },
  ],
  subjectResources: [
    { id: 'sres-1', subjectId: 'sub-1', name: 'Strategy Lecture Slides', url: 'https://drive.google.com', type: 'Google Drive', description: 'Weeks 1-6 slide decks', addedBy: 'mem-3', createdAt: iso(-20), updatedAt: iso(-20) },
    { id: 'sres-2', subjectId: 'sub-1', name: 'Porter Framework Video', url: 'https://youtube.com', type: 'YouTube', description: 'Explainer video referenced in class', addedBy: 'mem-5', createdAt: iso(-15), updatedAt: iso(-15) },
    { id: 'sres-3', subjectId: 'sub-2', name: 'Statistics Case Studies', url: 'https://docs.google.com', type: 'Google Docs', description: '', addedBy: 'mem-2', createdAt: iso(-12), updatedAt: iso(-12) },
    { id: 'sres-4', subjectId: 'sub-3', name: 'Cloud Migration Whitepaper', url: 'https://example.com', type: 'Article', description: '', addedBy: 'mem-6', createdAt: iso(-9), updatedAt: iso(-9) },
    { id: 'sres-5', subjectId: 'sub-4', name: 'Valuation Handbook', url: 'https://example.com', type: 'Case Study', description: '', addedBy: 'mem-1', createdAt: iso(-18), updatedAt: iso(-18) },
    { id: 'sres-6', subjectId: 'sub-1', name: 'Case Competition Brief', url: 'https://drive.google.com', type: 'Google Drive', description: '', addedBy: 'mem-4', createdAt: iso(-5), updatedAt: iso(-5) },
    { id: 'sres-7', subjectId: 'sub-2', name: 'Kaggle Churn Dataset', url: 'https://kaggle.com', type: 'Dataset', description: '', addedBy: 'mem-3', createdAt: iso(-11), updatedAt: iso(-11) },
    { id: 'sres-8', subjectId: 'sub-4', name: 'Damodaran WACC Notes', url: 'https://example.com', type: 'Article', description: '', addedBy: 'mem-5', createdAt: iso(-16), updatedAt: iso(-16) },
    { id: 'sres-9', subjectId: 'sub-3', name: 'Consulting Frameworks Deck', url: 'https://drive.google.com', type: 'Google Drive', description: '', addedBy: 'mem-6', createdAt: iso(-7), updatedAt: iso(-7) },
    { id: 'sres-10', subjectId: 'sub-2', name: 'A/B Testing Guide', url: 'https://example.com', type: 'Article', description: '', addedBy: 'mem-2', createdAt: iso(-2), updatedAt: iso(-2) },
  ],
};
