import React from 'react';

const NgoInfo = () => {
  const ngos = [
    {
      name: "Paws for Cause",
      focus: "Rescue & Shelter",
      address: "New Delhi, India",
      description: "A non-profit organization dedicated to rescuing stray animals and finding them permanent, loving homes. They also run awareness campaigns in local schools.",
      phone: "+91 98765 43210"
    },
    {
      name: "Animal Welfare Trust",
      focus: "Medical Care",
      address: "Mumbai, India",
      description: "Provides emergency medical assistance to injured street animals and runs a low-cost vaccination clinic for low-income families.",
      phone: "+91 90000 11111"
    }
  ];

  return (
    <div className="page-container" style={{padding: '2rem'}}>
      <div style={{textAlign: 'center', marginBottom: '3rem'}}>
        <h1 style={{fontSize: '2.5rem', color: 'var(--text-color)'}}>NGOs & Animal Welfare</h1>
        <p style={{color: 'var(--muted-text)', fontSize: '1.1rem'}}>Supporting organizations that protect our voiceless friends.</p>
      </div>

      <div style={{maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem'}}>
        {ngos.map((ngo, idx) => (
          <div key={idx} style={{display: 'flex', gap: '2rem', backgroundColor: 'var(--card)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)', alignItems: 'center', boxShadow: '0 10px 28px rgba(0,0,0,0.22)'}}>
            <div style={{fontSize: '4rem'}}>🏛️</div>
            <div>
              <h3 style={{margin: 0, fontSize: '1.5rem', color: 'var(--text-color)'}}>{ngo.name}</h3>
              <p style={{color: 'var(--accent)', fontWeight: '600', margin: '0.25rem 0'}}>{ngo.focus}</p>
              <p style={{color: 'var(--muted-text)', marginBottom: '1rem'}}>{ngo.description}</p>
              <div style={{display: 'flex', gap: '1.5rem', fontSize: '0.9rem', color: 'var(--muted-text)'}}>
                <span>📍 {ngo.address}</span>
                <span>📞 {ngo.phone}</span>
              </div>
            </div>
          </div>
        ))}

        <div style={{marginTop: '3rem', padding: '2rem', backgroundColor: 'var(--surface)', borderRadius: '16px', textAlign: 'center', border: '1px dashed rgba(74,222,128,0.25)'}}>
          <h3 style={{color: 'var(--text-color)'}}>Want to list your NGO?</h3>
          <p style={{color: 'var(--muted-text)'}}>We provide free listing and visibility for verified animal welfare organizations.</p>
          <button className="btn btn-primary" style={{marginTop: '1rem'}}>Contact Support</button>
        </div>
      </div>
    </div>
  );
};

export default NgoInfo;
