import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Calendar, Clock, FileText, CheckCircle } from "lucide-react";
import MeetingRequestForm from "@/components/MeetingRequestForm";
import MeetingResponseButtons from "@/components/MeetingResponseButtons";
import { updatePostStatus } from "@/actions/postActions";
import PartnerFoundButton from "@/components/PartnerFoundButton";

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const { id } = await params;
  
  const post = await db.post.findUnique({
    where: { id },
    include: {
      owner: {
        select: { institution: true, role: true, id: true }
      },
      meetingRequests: {
        include: { requester: { select: { email: true, role: true, institution: true } } }
      }
    }
  });

  if (!post) notFound();

  const isOwner = session?.userId === post.ownerId;
  const hasRequested = session && !isOwner ? post.meetingRequests.some(r => r.requesterId === session.userId) : false;

  return (
    <div className="fade-in" style={{ padding: '1rem 0', maxWidth: '900px', margin: '0 auto' }}>
      <Link href="/posts" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        <ArrowLeft size={16} /> Back to Discover
      </Link>

      <div className="card" style={{ padding: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
              <span className={`badge badge-${post.status.toLowerCase().split(' ')[0]}`}>{post.status}</span>
              {isOwner && post.status !== 'Partner Found' && (
                <PartnerFoundButton onConfirm={async () => {
                  "use server";
                  await updatePostStatus(post.id, "Partner Found");
                }} />
              )}
            </div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 700, lineHeight: 1.2 }}>{post.title}</h1>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Posted by</p>
            <p style={{ fontWeight: 600 }}>{post.owner.role}</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{post.owner.institution}</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '2.5rem', padding: '1rem', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={18} color="var(--accent-color)" />
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Domain</p>
              <p style={{ fontWeight: 500 }}>{post.domain}</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={18} color="var(--success-color)" />
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Required Expertise</p>
              <p style={{ fontWeight: 500 }}>{post.requiredExpertise}</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={18} color="#c084fc" />
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Project Stage</p>
              <p style={{ fontWeight: 500 }}>{post.projectStage}</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={18} color="#f43f5e" />
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>City</p>
              <p style={{ fontWeight: 500 }}>{post.city}</p>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>Description & High-Level Idea</h3>
          <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{post.description}</p>
        </div>

        <div style={{ marginBottom: '2rem', padding: '1rem', borderLeft: '4px solid var(--accent-color)', background: 'var(--accent-light)', borderRadius: '0 8px 8px 0' }}>
          <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--accent-color)' }}>Confidentiality Level: {post.confidentialityLevel}</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Detailed intellectual property and patient data constraints apply. Further details might only be revealed after an NDA is signed and a meeting is scheduled.</p>
        </div>

        {/* Meeting Request Section (For Others) */}
        {!isOwner && session && !hasRequested && post.status !== 'Partner Found' && (
          <MeetingRequestForm postId={post.id} />
        )}
        
        {!isOwner && session && !hasRequested && post.status === 'Partner Found' && (
          <div className="card" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'var(--success-color)', textAlign: 'center' }}>
            <h4 style={{ color: 'var(--success-color)', fontWeight: 600, marginBottom: '0.5rem' }}>Partner Found</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>This project has already found a partner and is no longer accepting new requests.</p>
          </div>
        )}

        {!isOwner && session && hasRequested && (
          <div className="card" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', borderColor: 'var(--accent-color)', textAlign: 'center' }}>
            <h4 style={{ color: 'var(--accent-color)', fontWeight: 600, marginBottom: '0.5rem' }}>You have requested a meeting!</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Pending response from the project owner.</p>
          </div>
        )}

        {!session && (
          <div className="card" style={{ textAlign: 'center' }}>
            <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Log in or register to express interest and request a meeting.</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <Link href="/login" className="btn btn-secondary">Login</Link>
              <Link href="/register" className="btn btn-primary">Register .edu Account</Link>
            </div>
          </div>
        )}

        {/* Requests Management (For Owner) */}
        {isOwner && (
          <div style={{ marginTop: '3rem', borderTop: '2px dashed var(--surface-border)', paddingTop: '2rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>Meeting Requests ({post.meetingRequests.length})</h3>
            
            {post.meetingRequests.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem', background: 'var(--surface-color)', borderRadius: '8px' }}>No meeting requests yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {post.meetingRequests.map(req => (
                  <div key={req.id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>{req.requester.role} from {req.requester.institution}</p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{req.requester.email}</p>
                      </div>
                      <span className={`badge`} style={{ 
                        background: req.status === 'Pending' ? 'rgba(234, 179, 8, 0.1)' : 
                                   req.status === 'Scheduled' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: req.status === 'Pending' ? '#eab308' : 
                               req.status === 'Scheduled' ? '#10b981' : '#ef4444'
                      }}>
                        {req.status}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '2rem', fontSize: '0.9rem' }}>
                      <div>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Proposed Time Slots</p>
                        <p style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={14} /> {req.timeSlots}</p>
                      </div>
                      {req.ndaAccepted && (
                        <div>
                          <p style={{ color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>NDA Status</p>
                          <p style={{ color: 'var(--success-color)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><CheckCircle size={14} /> Accepted</p>
                        </div>
                      )}
                    </div>
                    
                    {req.message && (
                      <div style={{ background: 'var(--bg-color)', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem' }}>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.2rem', fontSize: '0.8rem' }}>Message</p>
                        <p>{req.message}</p>
                      </div>
                    )}

                    {req.status === 'Pending' && (
                       <MeetingResponseButtons requestId={req.id} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
