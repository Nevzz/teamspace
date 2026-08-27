/**
 * TeamSpace — Google Apps Script backend
 * ---------------------------------------
 * A generic REST-ish CRUD API over a Google Sheet, used as the database for
 * the TeamSpace React app. Deploy this as a Web App (Execute as: Me,
 * Who has access: Anyone with the link) and paste the resulting /exec URL
 * into VITE_GOOGLE_APPS_SCRIPT_URL in the frontend's .env file.
 *
 * Endpoints (all via a single Web App URL):
 *   GET  ?action=list&sheet=Projects
 *   POST { action: "create", sheet: "Projects", record: {...} }
 *   POST { action: "update", sheet: "Projects", id: "proj-123", record: {...} }
 *   POST { action: "delete", sheet: "Projects", id: "proj-123" }
 *
 * Responses are always JSON: { data: ... } on success, { error: "..." } on failure.
 */

// ---- Sheet schema: column headers, in order, for every tab ----------------

const SHEETS = {
  Team: ['id', 'name', 'email', 'role', 'avatarColor', 'createdAt'],
  Subjects: ['id', 'name', 'code', 'professor', 'description', 'trimester', 'schedule', 'createdAt', 'updatedAt'],
  Projects: [
    'id', 'projectName', 'subjectId', 'course', 'description', 'objective', 'status', 'priority',
    'startDate', 'deadline', 'professor', 'presentationDate', 'submissionRequirements',
    'submissionLink', 'driveLink', 'createdAt', 'updatedAt',
  ],
  Tasks: ['id', 'projectId', 'taskName', 'description', 'assigneeId', 'status', 'priority', 'dueDate', 'notes', 'createdAt', 'updatedAt'],
  Milestones: ['id', 'projectId', 'title', 'date', 'type', 'notes', 'createdAt'],
  Resources: ['id', 'projectId', 'name', 'url', 'type', 'addedBy', 'createdAt'],
  Notes: ['id', 'projectId', 'title', 'content', 'authorId', 'createdAt', 'updatedAt'],
  Calendar: ['id', 'title', 'date', 'type', 'linkedType', 'linkedId', 'createdAt'],
  SubjectNotes: ['id', 'subjectId', 'title', 'topic', 'content', 'authorId', 'createdAt', 'updatedAt'],
  SubjectTopics: ['id', 'subjectId', 'topic', 'status', 'priority', 'notes', 'createdAt', 'updatedAt'],
  SubjectResources: ['id', 'subjectId', 'name', 'url', 'type', 'description', 'addedBy', 'createdAt', 'updatedAt'],
};

// ---- Web app entry points --------------------------------------------------

function doGet(e) {
  try {
    const action = e.parameter.action;
    const sheetName = e.parameter.sheet;

    if (action === 'list') {
      return jsonResponse({ data: listRecords(sheetName) });
    }
    return jsonResponse({ error: 'Unknown GET action: ' + action });
  } catch (err) {
    return jsonResponse({ error: err.message });
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000); // up to 10s, so concurrent writes from the 6 team members don't clobber each other
    const body = JSON.parse(e.postData.contents);
    const { action, sheet, id, record } = body;

    if (action === 'create') return jsonResponse({ data: createRecord(sheet, record) });
    if (action === 'update') return jsonResponse({ data: updateRecord(sheet, id, record) });
    if (action === 'delete') return jsonResponse({ data: deleteRecord(sheet, id) });
    return jsonResponse({ error: 'Unknown POST action: ' + action });
  } catch (err) {
    return jsonResponse({ error: err.message });
  } finally {
    lock.releaseLock();
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// ---- Generic sheet CRUD -----------------------------------------------------

function getSheet_(sheetName) {
  const headers = SHEETS[sheetName];
  if (!headers) throw new Error('Unknown sheet: ' + sheetName);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function rowToObject_(headers, row) {
  const obj = {};
  headers.forEach((h, i) => { obj[h] = row[i] !== undefined ? row[i] : ''; });
  return obj;
}

function listRecords(sheetName) {
  const headers = SHEETS[sheetName];
  const sheet = getSheet_(sheetName);
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];
  return values.slice(1)
    .filter((row) => row[0] !== '' && row[0] !== null)
    .map((row) => rowToObject_(headers, row));
}

function findRowIndexById_(sheet, id) {
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === id) return i + 1; // 1-indexed sheet row
  }
  return -1;
}

function createRecord(sheetName, record) {
  const headers = SHEETS[sheetName];
  const sheet = getSheet_(sheetName);
  const now = new Date().toISOString();
  const id = Utilities.getUuid();

  const full = Object.assign({}, record, { id: id });
  if (headers.indexOf('createdAt') !== -1) full.createdAt = now;
  if (headers.indexOf('updatedAt') !== -1) full.updatedAt = now;

  const row = headers.map((h) => (full[h] !== undefined ? full[h] : ''));
  sheet.appendRow(row);
  return rowToObject_(headers, row);
}

function updateRecord(sheetName, id, record) {
  const headers = SHEETS[sheetName];
  const sheet = getSheet_(sheetName);
  const rowIndex = findRowIndexById_(sheet, id);
  if (rowIndex === -1) throw new Error('Record not found: ' + id);

  const existingRow = sheet.getRange(rowIndex, 1, 1, headers.length).getValues()[0];
  const existing = rowToObject_(headers, existingRow);
  const merged = Object.assign({}, existing, record, { id: id });
  if (headers.indexOf('updatedAt') !== -1) merged.updatedAt = new Date().toISOString();

  const newRow = headers.map((h) => (merged[h] !== undefined ? merged[h] : ''));
  sheet.getRange(rowIndex, 1, 1, headers.length).setValues([newRow]);
  return rowToObject_(headers, newRow);
}

function deleteRecord(sheetName, id) {
  const sheet = getSheet_(sheetName);
  const rowIndex = findRowIndexById_(sheet, id);
  if (rowIndex === -1) throw new Error('Record not found: ' + id);
  sheet.deleteRow(rowIndex);
  return { id: id };
}

// ---- One-time setup: run this from the Apps Script editor ------------------
// (Extensions > Apps Script > select "setupSheets" from the function dropdown > Run)

function setupSheets() {
  Object.keys(SHEETS).forEach(function (sheetName) {
    getSheet_(sheetName);
  });
  SpreadsheetApp.getActiveSpreadsheet().toast('All sheets created. Run seedSampleData next.');
}

/**
 * Populates the spreadsheet with the same sample data the frontend ships
 * with in demo mode, so the app is useful immediately after setup.
 * Safe to run once on a fresh spreadsheet; re-running will duplicate rows.
 */
function seedSampleData() {
  setupSheets();

  const now = new Date();
  function iso(offsetDays) {
    const d = new Date(now);
    d.setDate(d.getDate() + (offsetDays || 0));
    return d.toISOString();
  }

  const team = [
    { name: 'Alex Chen', email: 'alex@team.edu', role: 'Team Lead', avatarColor: '#0A84FF' },
    { name: 'Nevin Roy', email: 'nevin@team.edu', role: 'Analyst', avatarColor: '#30D158' },
    { name: 'Priya Nair', email: 'priya@team.edu', role: 'Researcher', avatarColor: '#FF9F0A' },
    { name: 'Marcus Lee', email: 'marcus@team.edu', role: 'Designer', avatarColor: '#BF5AF2' },
    { name: 'Sara Ahmed', email: 'sara@team.edu', role: 'Writer', avatarColor: '#FF453A' },
    { name: 'Devika Rao', email: 'devika@team.edu', role: 'Coordinator', avatarColor: '#8E8E93' },
  ];
  const teamRecords = team.map((t) => createRecord('Team', t));
  const memberId = function (i) { return teamRecords[i].id; };

  const subjects = [
    { name: 'Strategic Management', code: 'MGT501', professor: 'Dr. Sharma', description: 'Corporate strategy and competitive analysis.', trimester: 'Trimester 3', schedule: 'Mon / Wed · 9:00 AM' },
    { name: 'Business Analytics', code: 'BAN410', professor: 'Dr. Kapoor', description: 'Applied statistics and data-driven decision making.', trimester: 'Trimester 3', schedule: 'Tue / Thu · 11:00 AM' },
    { name: 'Technology Consulting', code: 'TEC330', professor: 'Prof. Whitfield', description: 'Digital transformation and enterprise technology strategy.', trimester: 'Trimester 3', schedule: 'Wed / Fri · 2:00 PM' },
    { name: 'Financial Modeling', code: 'FIN420', professor: 'Dr. Alvarez', description: 'Valuation, forecasting, and financial statement modeling.', trimester: 'Trimester 3', schedule: 'Mon / Thu · 3:30 PM' },
  ];
  const subjectRecords = subjects.map((s) => createRecord('Subjects', s));
  const subjectId = function (i) { return subjectRecords[i].id; };

  const projects = [
    { projectName: 'Market Entry Analysis', subjectId: subjectId(0), course: 'Strategic Management', description: 'Evaluate entry strategy for a Southeast Asian market.', objective: 'Deliver a go-to-market recommendation.', status: 'in-progress', priority: 'high', startDate: iso(-14), deadline: iso(6), professor: 'Dr. Sharma', presentationDate: iso(8), submissionRequirements: '20-page report + slide deck', submissionLink: '', driveLink: '' },
    { projectName: 'Customer Churn Case Study', subjectId: subjectId(1), course: 'Business Analytics', description: 'Predictive model for subscription churn.', objective: 'Build and present a churn-reduction strategy.', status: 'in-progress', priority: 'medium', startDate: iso(-10), deadline: iso(1), professor: 'Dr. Kapoor', presentationDate: iso(3), submissionRequirements: 'Notebook + memo', submissionLink: '', driveLink: '' },
    { projectName: 'Digital Transformation Roadmap', subjectId: subjectId(2), course: 'Technology Consulting', description: 'Roadmap for a legacy retailer moving to cloud-native operations.', objective: 'Present a phased 18-month transformation plan.', status: 'not-started', priority: 'medium', startDate: iso(2), deadline: iso(18), professor: 'Prof. Whitfield', presentationDate: iso(20), submissionRequirements: 'Slide deck', submissionLink: '', driveLink: '' },
    { projectName: 'DCF Valuation Project', subjectId: subjectId(3), course: 'Financial Modeling', description: 'Full DCF valuation of a publicly traded company.', objective: 'Build a 3-statement model and defend an investment thesis.', status: 'at-risk', priority: 'high', startDate: iso(-20), deadline: iso(-1), professor: 'Dr. Alvarez', presentationDate: iso(2), submissionRequirements: 'Excel model + 1-pager', submissionLink: '', driveLink: '' },
  ];
  const projectRecords = projects.map((p) => createRecord('Projects', p));
  const projectId = function (i) { return projectRecords[i].id; };

  const tasks = [
    { projectId: projectId(0), taskName: 'Finalize market sizing', assigneeId: memberId(0), status: 'in-progress', priority: 'high', dueDate: iso(0) },
    { projectId: projectId(0), taskName: 'Complete competitor analysis', assigneeId: memberId(0), status: 'todo', priority: 'medium', dueDate: iso(4) },
    { projectId: projectId(0), taskName: 'Draft entry strategy slide', assigneeId: memberId(3), status: 'todo', priority: 'medium', dueDate: iso(5) },
    { projectId: projectId(0), taskName: 'Review regulatory risks', assigneeId: memberId(2), status: 'review', priority: 'low', dueDate: iso(3) },
    { projectId: projectId(1), taskName: 'Submit case analysis', assigneeId: memberId(1), status: 'in-progress', priority: 'high', dueDate: iso(1) },
    { projectId: projectId(1), taskName: 'Clean churn dataset', assigneeId: memberId(1), status: 'done', priority: 'medium', dueDate: iso(-2) },
    { projectId: projectId(1), taskName: 'Build cohort visualization', assigneeId: memberId(2), status: 'review', priority: 'medium', dueDate: iso(0) },
    { projectId: projectId(2), taskName: 'Group presentation', assigneeId: memberId(5), status: 'todo', priority: 'high', dueDate: iso(2) },
    { projectId: projectId(2), taskName: 'Audit current tech stack', assigneeId: memberId(4), status: 'todo', priority: 'medium', dueDate: iso(6) },
    { projectId: projectId(3), taskName: 'Build revenue projections', assigneeId: memberId(0), status: 'in-progress', priority: 'high', dueDate: iso(-1) },
    { projectId: projectId(3), taskName: 'WACC sensitivity table', assigneeId: memberId(3), status: 'todo', priority: 'medium', dueDate: iso(1) },
    { projectId: projectId(3), taskName: 'Peer comps benchmarking', assigneeId: memberId(4), status: 'done', priority: 'low', dueDate: iso(-5) },
    { projectId: projectId(0), taskName: 'Interview local distributor contact', assigneeId: memberId(5), status: 'done', priority: 'low', dueDate: iso(-3) },
    { projectId: projectId(1), taskName: 'Present findings to class', assigneeId: memberId(1), status: 'todo', priority: 'high', dueDate: iso(3) },
    { projectId: projectId(2), taskName: 'Vendor shortlist', assigneeId: memberId(2), status: 'todo', priority: 'low', dueDate: iso(10) },
    { projectId: projectId(3), taskName: 'Finalize investment memo', assigneeId: memberId(0), status: 'review', priority: 'high', dueDate: iso(1) },
    { projectId: projectId(0), taskName: 'Executive summary draft', assigneeId: memberId(4), status: 'in-progress', priority: 'medium', dueDate: iso(2) },
    { projectId: projectId(1), taskName: 'Peer review notebook', assigneeId: memberId(3), status: 'todo', priority: 'low', dueDate: iso(2) },
  ];
  tasks.forEach(function (t) { createRecord('Tasks', Object.assign({ description: '', notes: '' }, t)); });

  createRecord('Milestones', { projectId: projectId(0), title: 'Group presentation', date: iso(8), type: 'presentation', notes: '' });
  createRecord('Milestones', { projectId: projectId(3), title: 'Investment committee review', date: iso(2), type: 'meeting', notes: '' });

  createRecord('Resources', { projectId: projectId(0), name: 'Market Research Database', url: 'https://drive.google.com', type: 'Google Drive', addedBy: memberId(2) });
  createRecord('Resources', { projectId: projectId(3), name: 'DCF Template', url: 'https://docs.google.com', type: 'Google Docs', addedBy: memberId(0) });

  createRecord('Notes', { projectId: projectId(0), title: 'Kickoff meeting notes', content: 'Aligned on scope and timeline with the professor.', authorId: memberId(0) });

  createRecord('Calendar', { title: 'Finalize market analysis', date: iso(0), type: 'deadline', linkedType: 'task', linkedId: '' });
  createRecord('Calendar', { title: 'Submit case analysis', date: iso(1), type: 'deadline', linkedType: 'task', linkedId: '' });
  createRecord('Calendar', { title: 'Group presentation', date: iso(8), type: 'presentation', linkedType: 'project', linkedId: projectId(0) });
  createRecord('Calendar', { title: 'Investment committee review', date: iso(2), type: 'meeting', linkedType: 'project', linkedId: projectId(3) });

  const subjectNotes = [
    { subjectId: subjectId(0), title: "Porter's Five Forces", topic: 'Competitive Strategy', content: 'Framework for analyzing industry competitiveness.', authorId: memberId(1) },
    { subjectId: subjectId(0), title: 'Blue Ocean Strategy', topic: 'Strategy Frameworks', content: 'Creating uncontested market space rather than competing head-on.', authorId: memberId(4) },
    { subjectId: subjectId(1), title: 'Regression Diagnostics', topic: 'Statistical Modeling', content: 'Checklist for validating linear regression assumptions.', authorId: memberId(2) },
    { subjectId: subjectId(2), title: 'Cloud Migration Patterns', topic: 'Enterprise Architecture', content: 'Rehost, replatform, refactor, repurchase, retire, retain.', authorId: memberId(5) },
    { subjectId: subjectId(3), title: 'WACC Calculation', topic: 'Valuation', content: 'Blends cost of equity and after-tax cost of debt.', authorId: memberId(0) },
    { subjectId: subjectId(0), title: 'SWOT in Practice', topic: 'Strategy Frameworks', content: 'Applying SWOT alongside PESTEL for a fuller external view.', authorId: memberId(3) },
    { subjectId: subjectId(1), title: 'A/B Testing Pitfalls', topic: 'Experimentation', content: 'Peeking early, novelty effects, underpowered samples.', authorId: memberId(1) },
    { subjectId: subjectId(3), title: 'Terminal Value Methods', topic: 'Valuation', content: 'Gordon growth vs. exit multiple approaches.', authorId: memberId(4) },
    { subjectId: subjectId(2), title: 'Vendor Evaluation Criteria', topic: 'Procurement', content: 'Cost, scalability, security posture, integration effort.', authorId: memberId(2) },
    { subjectId: subjectId(0), title: 'Value Chain Mapping', topic: 'Strategy Frameworks', content: "Primary vs. support activities in Porter's value chain.", authorId: memberId(5) },
  ];
  subjectNotes.forEach(function (n) { createRecord('SubjectNotes', n); });

  const subjectTopics = [
    { subjectId: subjectId(0), topic: "Porter's Five Forces", status: 'complete', priority: 'high', notes: '' },
    { subjectId: subjectId(0), topic: 'SWOT Analysis', status: 'complete', priority: 'medium', notes: '' },
    { subjectId: subjectId(0), topic: 'Blue Ocean Strategy', status: 'pending', priority: 'medium', notes: '' },
    { subjectId: subjectId(0), topic: 'Value Chain Analysis', status: 'pending', priority: 'low', notes: '' },
    { subjectId: subjectId(1), topic: 'Regression Analysis', status: 'complete', priority: 'high', notes: '' },
    { subjectId: subjectId(1), topic: 'Hypothesis Testing', status: 'pending', priority: 'medium', notes: '' },
    { subjectId: subjectId(2), topic: 'Cloud Architecture', status: 'complete', priority: 'high', notes: '' },
    { subjectId: subjectId(2), topic: 'Agile Delivery', status: 'pending', priority: 'low', notes: '' },
    { subjectId: subjectId(3), topic: 'DCF Modeling', status: 'complete', priority: 'high', notes: '' },
    { subjectId: subjectId(3), topic: 'Comparable Company Analysis', status: 'pending', priority: 'medium', notes: '' },
  ];
  subjectTopics.forEach(function (t) { createRecord('SubjectTopics', t); });

  const subjectResources = [
    { subjectId: subjectId(0), name: 'Strategy Lecture Slides', url: 'https://drive.google.com', type: 'Google Drive', description: 'Weeks 1-6 slide decks', addedBy: memberId(2) },
    { subjectId: subjectId(0), name: 'Porter Framework Video', url: 'https://youtube.com', type: 'YouTube', description: '', addedBy: memberId(4) },
    { subjectId: subjectId(1), name: 'Statistics Case Studies', url: 'https://docs.google.com', type: 'Google Docs', description: '', addedBy: memberId(1) },
    { subjectId: subjectId(2), name: 'Cloud Migration Whitepaper', url: 'https://example.com', type: 'Article', description: '', addedBy: memberId(5) },
    { subjectId: subjectId(3), name: 'Valuation Handbook', url: 'https://example.com', type: 'Case Study', description: '', addedBy: memberId(0) },
    { subjectId: subjectId(0), name: 'Case Competition Brief', url: 'https://drive.google.com', type: 'Google Drive', description: '', addedBy: memberId(3) },
    { subjectId: subjectId(1), name: 'Kaggle Churn Dataset', url: 'https://kaggle.com', type: 'Dataset', description: '', addedBy: memberId(2) },
    { subjectId: subjectId(3), name: 'Damodaran WACC Notes', url: 'https://example.com', type: 'Article', description: '', addedBy: memberId(4) },
    { subjectId: subjectId(2), name: 'Consulting Frameworks Deck', url: 'https://drive.google.com', type: 'Google Drive', description: '', addedBy: memberId(5) },
    { subjectId: subjectId(1), name: 'A/B Testing Guide', url: 'https://example.com', type: 'Article', description: '', addedBy: memberId(1) },
  ];
  subjectResources.forEach(function (r) { createRecord('SubjectResources', r); });

  SpreadsheetApp.getActiveSpreadsheet().toast('Sample data seeded successfully.');
}
