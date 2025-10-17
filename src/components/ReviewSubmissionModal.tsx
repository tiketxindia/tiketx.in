import React from 'react';
import { Film, Users, Upload } from 'lucide-react';

interface ReviewSubmissionModalProps {
  open: boolean;
  onClose: () => void;
  submission: {
    film_title: string;
    name: string;
    email: string;
    production_house_name: string;
    phone: string;
    country: string;
    expected_ticket_price: number;
    preview_link: string;
    planned_release_date: string;
    message: string;
    submitted_at: string;
    synopsis: string;
    submission_rejection_reason?: string;
  };
  onApprove: () => void;
  onReject: (reason: string) => void;
}

const ReviewSubmissionModal: React.FC<ReviewSubmissionModalProps> = ({
  open,
  onClose,
  submission,
  onApprove,
  onReject,
}) => {
  const [rejectionReason, setRejectionReason] = React.useState("");
  const [showRejectionField, setShowRejectionField] = React.useState(false);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white rounded-2xl border border-gray-700 shadow-2xl p-8 w-full max-w-3xl transition-all duration-300">
        <h2 className="text-3xl font-extrabold mb-6 bg-gradient-to-r from-blue-400 via-blue-600 to-blue-400 bg-clip-text text-transparent drop-shadow-lg tracking-tight">
          Review Film Submission
        </h2>
        <div className="mb-8">
          <div className="mb-4">
            <span className="font-semibold text-red-300">Previous Rejection Reason:&nbsp;</span>
            <span className="italic text-red-200">{submission?.submission_rejection_reason ? submission.submission_rejection_reason : 'No'}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Film className="w-5 h-5 text-blue-400" />
                <span className="font-semibold text-blue-300">Film Title:</span>
                <span className="text-white">{submission.film_title}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                <span className="font-semibold text-blue-300">Name:</span>
                <span className="text-white">{submission.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-blue-300">Production House:</span>
                <span className="text-white">{submission.production_house_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-blue-300">Country:</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-900 text-blue-200 text-xs font-bold">
                  {submission.country}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-blue-300">Expected Ticket Price:</span>
                <span className="px-2 py-0.5 rounded-full bg-green-900 text-green-300 text-xs font-bold">
                  ₹{submission.expected_ticket_price}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-blue-300">Email:</span>
                <span className="text-white">{submission.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-blue-300">Phone:</span>
                <span className="text-white">{submission.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-blue-300">Preview Link:</span>
                <a
                  href={submission.preview_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-500 transition flex items-center gap-1"
                >
                  <Upload className="w-4 h-4" /> Open Link
                </a>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-blue-300">Planned Release Date:</span>
                <span className="text-white">{submission.planned_release_date}</span>
              </div>
            </div>
          </div>
          <hr className="my-4 border-blue-900/40" />
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-blue-300">Message:</span>
              <span className="text-white">{submission.message}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-blue-300">Submitted At:</span>
              <span className="text-white">{submission.submitted_at}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-blue-300">Synopsis:</span>
              <span className="text-white">{submission.synopsis}</span>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-4 mt-2">
          <div className="flex flex-col gap-2 justify-end w-full">
            {!showRejectionField ? (
              <div className="flex gap-2">
                <button
                  onClick={onApprove}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-green-500 to-green-400 text-white font-bold shadow hover:scale-105 transition"
                >
                  Approve
                </button>
                <button
                  onClick={() => setShowRejectionField(true)}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-500 to-red-400 text-white font-bold shadow hover:scale-105 transition"
                >
                  Reject
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-gray-700 text-gray-200 font-bold shadow hover:bg-gray-600 transition"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 w-full">
                <label className="text-sm font-semibold text-red-300 mb-1" htmlFor="rejectionReason">Rejection Reason (optional)</label>
                <textarea
                  id="rejectionReason"
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  className="w-full bg-black/40 border border-red-400/30 rounded-xl px-4 py-2 text-sm text-red-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows={2}
                  placeholder="Add comments for rejection (optional)"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => setShowRejectionField(false)}
                    className="px-5 py-2 rounded-xl bg-gray-700 text-gray-200 font-bold shadow hover:bg-gray-600 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => onReject(rejectionReason)}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-500 to-red-400 text-white font-bold shadow hover:scale-105 transition"
                  >
                    Confirm Reject
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewSubmissionModal;
