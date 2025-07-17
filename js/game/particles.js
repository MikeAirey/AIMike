/**
 * Particle System
 * Handles visual particle effects for brick destruction and other events
 */
export class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    create(x, y, color, count = 8) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x,
                y: y,
                dx: (Math.random() - 0.5) * 8,
                dy: (Math.random() - 0.5) * 8,
                color: color,
                life: 30,
                maxLife: 30,
                size: Math.random() * 3 + 1
            });
        }
    }

    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.x += particle.dx;
            particle.y += particle.dy;
            particle.dy += 0.3; // Gravity
            particle.life--;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        this.particles.forEach(particle => {
            const alpha = particle.life / particle.maxLife;
            ctx.fillStyle = particle.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
            ctx.fillRect(particle.x - particle.size/2, particle.y - particle.size/2, particle.size, particle.size);
        });
    }

    // Create explosion effect
    createExplosion(x, y, color, count = 12) {
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const speed = Math.random() * 6 + 2;
            
            this.particles.push({
                x: x,
                y: y,
                dx: Math.cos(angle) * speed,
                dy: Math.sin(angle) * speed,
                color: color,
                life: 40,
                maxLife: 40,
                size: Math.random() * 4 + 2
            });
        }
    }

    // Create spark effect
    createSparks(x, y, count = 6) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x,
                y: y,
                dx: (Math.random() - 0.5) * 12,
                dy: (Math.random() - 0.5) * 12,
                color: '#ffff44',
                life: 20,
                maxLife: 20,
                size: 1
            });
        }
    }

    // Create trail effect
    createTrail(x, y, color, count = 3) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x + (Math.random() - 0.5) * 4,
                y: y + (Math.random() - 0.5) * 4,
                dx: (Math.random() - 0.5) * 2,
                dy: (Math.random() - 0.5) * 2,
                color: color,
                life: 15,
                maxLife: 15,
                size: Math.random() * 2 + 0.5
            });
        }
    }

    // Clear all particles
    clear() {
        this.particles.length = 0;
    }

    // Get particle count
    getCount() {
        return this.particles.length;
    }

    // Check if particles are active
    hasParticles() {
        return this.particles.length > 0;
    }
}
