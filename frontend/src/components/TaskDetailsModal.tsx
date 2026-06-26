import React, { useEffect, useState } from 'react';
import { getTaskById, updateTask } from '../services/task.service';
import type { Task } from '../services/task.service';
import { getTaskComments, createComment, updateComment, deleteComment } from '../services/comment.service';
import type { Comment } from '../services/comment.service';
import { getTaskAttachments, uploadAttachment, deleteAttachment } from '../services/attachment.service';
import type { Attachment } from '../services/attachment.service';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/Button';

interface TaskDetailsModalProps {
  taskId: number;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdated?: () => void; // Callback to notify parent (e.g. Kanban board) of status/metadata updates
}

export const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({ taskId, isOpen, onClose, onTaskUpdated }) => {
  const { user: currentUser } = useAuth();

  const [task, setTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Comment input state
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');

  // Attachment input state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Status update state
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Rejection modal state
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionError, setRejectionError] = useState('');
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      const [taskData, commentsData, attachmentsData] = await Promise.all([
        getTaskById(taskId),
        getTaskComments(taskId),
        getTaskAttachments(taskId)
      ]);
      setTask(taskData);
      setComments(commentsData);
      setAttachments(attachmentsData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && taskId) {
      loadData();
    }
  }, [isOpen, taskId]);

  if (!isOpen) return null;

  const handleStatusChange = async (newStatus: string) => {
    if (!task) return;

    if (task.status === 'REVIEW' && newStatus === 'IN_PROGRESS' && currentUser?.role !== 'Collaborator') {
      setPendingStatus(newStatus);
      setRejectionReason('');
      setRejectionError('');
      setRejectionModalOpen(true);
      return;
    }

    await executeStatusChange(newStatus);
  };

  const executeStatusChange = async (newStatus: string, reason?: string) => {
    try {
      setUpdatingStatus(true);
      if (reason) {
        const created = await createComment(taskId, reason);
        setComments(prev => [...prev, created]);
      }
      const updated = await updateTask(task.task_id, { status: newStatus });
      setTask(updated);
      if (onTaskUpdated) onTaskUpdated();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update task status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleConfirmRejection = async () => {
    if (!rejectionReason.trim()) {
      setRejectionError('Please enter a reason for rejection.');
      return;
    }
    if (!pendingStatus) return;

    const statusToSet = pendingStatus;
    const reasonToSet = rejectionReason.trim();

    setRejectionModalOpen(false);
    setPendingStatus(null);
    setRejectionReason('');

    await executeStatusChange(statusToSet, reasonToSet);
  };

  const handleCancelRejection = () => {
    setRejectionModalOpen(false);
    setPendingStatus(null);
    setRejectionReason('');
    setRejectionError('');
  };

  // Comments handlers
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setError('');
      const created = await createComment(taskId, newComment);
      setComments([...comments, created]);
      setNewComment('');
      setSuccess('Comment posted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to post comment');
    }
  };

  const handleEditComment = (comment: Comment) => {
    setEditingCommentId(comment.comment_id);
    setEditingCommentText(comment.comment_text);
  };

  const handleUpdateComment = async (commentId: number) => {
    if (!editingCommentText.trim()) return;
    try {
      setError('');
      const updated = await updateComment(commentId, editingCommentText);
      setComments(comments.map(c => c.comment_id === commentId ? updated : c));
      setEditingCommentId(null);
      setSuccess('Comment updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update comment');
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      setError('');
      await deleteComment(commentId);
      setComments(comments.filter(c => c.comment_id !== commentId));
      setSuccess('Comment deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete comment');
    }
  };

  // Attachments handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // File validation: limit 5MB
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds the 5MB limit.');
        return;
      }

      // Type validation
      const allowedExtensions = /\.(pdf|docx|png|jpg|jpeg)$/i;
      if (!allowedExtensions.test(file.name)) {
        alert('Only PDF, DOCX, PNG, JPG, and JPEG files are allowed.');
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUploadFile = async () => {
    if (!selectedFile) return;
    try {
      setUploading(true);
      setError('');
      const attachment = await uploadAttachment(taskId, selectedFile);
      setAttachments([...attachments, attachment]);
      setSelectedFile(null);
      
      // Reset input element
      const fileInput = document.getElementById('file-upload-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      setSuccess('File uploaded successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId: number) => {
    if (!window.confirm('Are you sure you want to delete this file attachment?')) return;
    try {
      setError('');
      await deleteAttachment(attachmentId);
      setAttachments(attachments.filter(a => a.attachment_id !== attachmentId));
      setSuccess('Attachment deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete attachment');
    }
  };

  const formatDueDate = (dateStr: string | null) => {
    if (!dateStr) return 'No due date';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString();
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'URGENT':
      case 'Critical':
        return '#ef4444';
      case 'HIGH':
      case 'High':
        return '#f59e0b';
      case 'MEDIUM':
      case 'Medium':
        return '#3b82f6';
      case 'LOW':
      case 'Low':
        return '#10b981';
      default:
        return 'var(--text-secondary)';
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return '📕';
    if (ext === 'docx') return '📘';
    if (['png', 'jpg', 'jpeg'].includes(ext || '')) return '🖼️';
    return '📄';
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1200,
      padding: '1rem'
    }} onClick={onClose}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '1000px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        padding: '2rem',
        position: 'relative',
        background: 'var(--surface-color)',
        border: '1px solid var(--surface-border)',
        color: 'var(--text-primary)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }} onClick={(e) => e.stopPropagation()}>
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem', right: '1.75rem',
            background: 'none', border: 'none',
            color: 'var(--text-secondary)',
            fontSize: '1.75rem',
            cursor: 'pointer',
            transition: 'color 0.2s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
        >&times;</button>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading task details...
          </div>
        ) : !task ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--error-color)' }}>
            Task not found.
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '1rem' }}>
              <span style={{ 
                textTransform: 'uppercase', 
                fontSize: '0.75rem', 
                fontWeight: 700, 
                letterSpacing: '1px',
                color: 'var(--primary-color)' 
              }}>
                Task Details
              </span>
              <h2 style={{ margin: '0.25rem 0', fontSize: '1.75rem' }}>{task.title}</h2>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>
                Project: <strong style={{ color: 'var(--text-primary)', marginLeft: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '14ch', display: 'inline-block', verticalAlign: 'bottom' }} title={task.project?.project_name || 'N/A'}>{task.project?.project_name || 'N/A'}</strong>
              </p>
            </div>

            {/* Error and Success Banners */}
            {error && <div className="error-message" style={{ marginBottom: '1.25rem' }}>{error}</div>}
            {success && (
              <div className="error-message" style={{ 
                marginBottom: '1.25rem', 
                background: 'rgba(16, 185, 129, 0.1)', 
                color: 'var(--success-color)' 
              }}>
                {success}
              </div>
            )}

            {/* Layout Grid */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '2fr 1fr', 
              gap: '2rem', 
              overflowY: 'auto',
              flex: 1,
              paddingRight: '0.5rem'
            }}>
              
              {/* Left Column: Description & Comments */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                
                {/* Description */}
                <div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', fontWeight: 600 }}>Description</h3>
                  <div style={{ 
                    padding: '1.25rem', 
                    background: 'var(--bg-gradient)', 
                    border: '1px solid var(--surface-border)',
                    borderRadius: '8px',
                    lineHeight: '1.6',
                    color: task.description ? 'var(--text-primary)' : 'var(--text-secondary)',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {task.description || 'No description provided.'}
                  </div>
                </div>

                {/* Comments Area */}
                <div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 600 }}>
                    Comments ({comments.length})
                  </h3>

                  {/* Add Comment Form */}
                  <form onSubmit={handleAddComment} style={{ marginBottom: '1.5rem' }}>
                    <textarea
                      className="input-field"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a comment..."
                      rows={3}
                      style={{ 
                        resize: 'vertical', 
                        minHeight: '80px', 
                        marginBottom: '0.75rem',
                        fontSize: '0.95rem'
                      }}
                      required
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button type="submit" style={{ width: 'auto', padding: '0.5rem 1.5rem' }}>
                        Post Comment
                      </Button>
                    </div>
                  </form>

                  {/* Comments List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {comments.length === 0 ? (
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontStyle: 'italic' }}>
                        No comments yet. Start the conversation!
                      </p>
                    ) : (
                      comments.map(c => {
                        const isOwner = c.user_id === currentUser?.user_id;
                        const isAdmin = currentUser?.role === 'Admin';
                        const canModify = isOwner || isAdmin;
                        const isEditing = editingCommentId === c.comment_id;

                        return (
                          <div key={c.comment_id} style={{
                            padding: '1rem',
                            background: 'var(--bg-gradient)',
                            border: '1px solid var(--surface-border)',
                            borderRadius: '8px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem'
                          }}>
                            {/* Comment Meta */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{
                                  width: '28px', height: '28px',
                                  borderRadius: '50%',
                                  background: 'var(--primary-color)',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontSize: '0.85rem', fontWeight: 700
                                }}>
                                  {c.user?.username?.charAt(0).toUpperCase()}
                                </div>
                                <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{c.user?.username}</span>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                  {new Date(c.created_at).toLocaleString()}
                                </span>
                              </div>

                              {/* Comment Actions (Edit/Delete) */}
                              {canModify && !isEditing && (
                                <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8rem' }}>
                                  {isOwner && (
                                    <button 
                                      onClick={() => handleEditComment(c)}
                                      style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', textDecoration: 'underline' }}
                                    >Edit</button>
                                  )}
                                  <button 
                                    onClick={() => handleDeleteComment(c.comment_id)}
                                    style={{ background: 'none', border: 'none', color: 'var(--error-color)', cursor: 'pointer', textDecoration: 'underline' }}
                                  >Delete</button>
                                </div>
                              )}
                            </div>

                            {/* Comment Content */}
                            {isEditing ? (
                              <div style={{ marginTop: '0.25rem' }}>
                                <textarea
                                  className="input-field"
                                  value={editingCommentText}
                                  onChange={(e) => setEditingCommentText(e.target.value)}
                                  rows={2}
                                  style={{ marginBottom: '0.5rem', fontSize: '0.95rem' }}
                                  required
                                />
                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                  <Button 
                                    onClick={() => setEditingCommentId(null)}
                                    style={{ width: 'auto', padding: '0.25rem 1rem', background: 'var(--surface-color)', color: 'var(--text-primary)' }}
                                  >Cancel</Button>
                                  <Button 
                                    onClick={() => handleUpdateComment(c.comment_id)}
                                    style={{ width: 'auto', padding: '0.25rem 1rem' }}
                                  >Save</Button>
                                </div>
                              </div>
                            ) : (
                              <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                                {c.comment_text}
                              </p>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

              </div>

              {/* Right Column: Metadata & Attachments */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', borderLeft: '1px solid var(--surface-border)', paddingLeft: '2rem' }}>
                
                {/* Meta details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  
                  {/* Status Dropdown */}
                  <div>
                    <span style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.4rem' }}>Status</span>
                    <select
                      className="input-field"
                      value={task.status}
                      disabled={updatingStatus}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      style={{ marginBottom: 0, padding: '0.5rem', background: 'var(--bg-gradient)', border: '1px solid var(--surface-border)', width: '100%', height: 'auto', cursor: 'pointer', color: 'var(--text-primary)' }}
                    >
                      <option value="TODO">TODO</option>
                      <option value="IN_PROGRESS">IN PROGRESS</option>
                      <option value="REVIEW">REVIEW</option>
                      {currentUser?.role !== 'Collaborator' && <option value="DONE">DONE</option>}
                    </select>
                  </div>

                  {/* Priority Accent */}
                  <div>
                    <span style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.4rem' }}>Priority</span>
                    <span style={{ 
                      display: 'inline-block',
                      padding: '0.3rem 0.8rem',
                      borderRadius: '999px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: '#fff',
                      backgroundColor: getPriorityColor(task.priority),
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {task.priority || 'Medium'}
                    </span>
                  </div>

                  {/* Due Date */}
                  <div>
                    <span style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.2rem' }}>Due Date</span>
                    <strong style={{ fontSize: '0.95rem' }}>{formatDueDate(task.due_date)}</strong>
                  </div>

                  {/* Assignees */}
                  <div>
                    <span style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Assignees</span>
                    {(!task.assignees || task.assignees.length === 0) ? (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>Unassigned</span>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {task.assignees.map(a => (
                          <div key={a.task_assigned_id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                            <div style={{
                              width: '20px', height: '20px',
                              borderRadius: '50%',
                              background: 'var(--bg-gradient)',
                              color: 'var(--primary-color)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '0.75rem', fontWeight: 'bold'
                            }}>
                              {a.user?.username?.charAt(0).toUpperCase()}
                            </div>
                            <span>{a.user?.username}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Attachments Section */}
                <div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 600 }}>Attachments</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input 
                        type="file" 
                        id="file-upload-input"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                        accept=".pdf,.docx,.png,.jpg,.jpeg"
                      />
                      <Button 
                        onClick={() => document.getElementById('file-upload-input')?.click()}
                        style={{ padding: '0.5rem 1rem', background: 'var(--bg-gradient)', border: '1px dashed var(--primary-color)', color: 'var(--primary-color)' }}
                      >
                        {selectedFile ? selectedFile.name : 'Choose File...'}
                      </Button>
                      <Button 
                        onClick={handleUploadFile}
                        disabled={!selectedFile || uploading}
                        style={{ padding: '0.5rem 1rem' }}
                      >
                        {uploading ? 'Uploading...' : 'Upload'}
                      </Button>
                    </div>

                    {attachments.length === 0 ? (
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                        No attachments.
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                        {attachments.map(a => (
                          <div key={a.attachment_id} style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '0.5rem', background: 'var(--bg-gradient)', border: '1px solid var(--surface-border)', borderRadius: '4px'
                          }}>
                            <a href={a.file_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'var(--text-primary)', fontSize: '0.9rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={a.file_name}>
                              <span style={{ fontSize: '1.25rem' }}>{getFileIcon(a.file_name)}</span>
                              {a.file_name}
                            </a>
                            {(a.uploaded_by_user_id === currentUser?.user_id || currentUser?.role === 'Admin') && (
                              <button onClick={() => handleDeleteAttachment(a.attachment_id)} style={{ background: 'none', border: 'none', color: 'var(--error-color)', cursor: 'pointer', fontSize: '1.1rem' }}>&times;</button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </>
        )}
        {rejectionModalOpen && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1300,
            padding: '1rem'
          }} onClick={handleCancelRejection}>
            <div style={{
              width: '100%',
              maxWidth: '480px',
              background: 'linear-gradient(135deg, #1b3222 0%, #0c1810 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '2rem',
              color: '#fff',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)',
              position: 'relative'
            }} onClick={(e) => e.stopPropagation()}>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: 600, color: '#fff' }}>Reason for Rejection</h3>
              
              <textarea
                value={rejectionReason}
                onChange={(e) => {
                  setRejectionReason(e.target.value);
                  if (e.target.value.trim()) setRejectionError('');
                }}
                placeholder="Type the reason for rejection here..."
                style={{
                  width: '100%',
                  height: '120px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: rejectionError ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '10px',
                  color: '#fff',
                  padding: '0.75rem',
                  fontSize: '0.95rem',
                  resize: 'none',
                  outline: 'none',
                  fontFamily: 'inherit',
                  transition: 'border-color 0.2s'
                }}
              />
              {rejectionError && (
                <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                  {rejectionError}
                </div>
              )}
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button 
                  onClick={handleCancelRejection}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: '#9ca3af',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    padding: '0.6rem 1.2rem',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.color = '#9ca3af';
                  }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmRejection}
                  style={{
                    background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '0.6rem 1.2rem',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 0 12px rgba(16, 185, 129, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(16, 185, 129, 0.2)';
                  }}
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
