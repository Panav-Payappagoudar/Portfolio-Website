export function initBackground() {
    const canvas = document.createElement('canvas');
    canvas.id = 'canvas-bg';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-20';
    canvas.style.pointerEvents = 'none';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let width, height;

    const resize = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    };
    window.addEventListener('resize', resize);
    resize();

    const particles = [];
    const particleCount = 100;

    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 2 + 0.5,
            opacity: Math.random() * 0.5 + 0.1
        });
    }

    // Orb parameters
    const orbs = [
        { x: width * 0.2, y: height * 0.3, radius: 400, color: 'rgba(59, 130, 246, 0.05)', vx: 0.2, vy: 0.15 },
        { x: width * 0.8, y: height * 0.7, radius: 500, color: 'rgba(139, 92, 246, 0.05)', vx: -0.15, vy: -0.2 }
    ];

    const draw = () => {
        ctx.clearRect(0, 0, width, height);

        // Draw Orbs
        orbs.forEach(orb => {
            orb.x += orb.vx;
            orb.y += orb.vy;

            if (orb.x < -orb.radius || orb.x > width + orb.radius) orb.vx *= -1;
            if (orb.y < -orb.radius || orb.y > height + orb.radius) orb.vy *= -1;

            const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius);
            gradient.addColorStop(0, orb.color);
            gradient.addColorStop(1, 'transparent');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw Particles
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0 || p.x > width) p.vx *= -1;
            if (p.y < 0 || p.y > height) p.vy *= -1;

            ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });

        requestAnimationFrame(draw);
    };

    draw();
}
