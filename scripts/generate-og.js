import fs from 'fs/promises';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateOGImage() {
    console.log('Generating OG Image...');
    
    // Fetch a premium font buffer (Roboto Bold)
    const fontResponse = await fetch('https://raw.githubusercontent.com/googlefonts/roboto/main/src/hinted/Roboto-Bold.ttf');
    if (!fontResponse.ok) {
        throw new Error('Failed to fetch font: ' + fontResponse.statusText);
    }
    const fontBuffer = await fontResponse.arrayBuffer();

    // Fetch Roboto Regular for subtitle
    const fontRegResponse = await fetch('https://raw.githubusercontent.com/googlefonts/roboto/main/src/hinted/Roboto-Regular.ttf');
    const fontRegBuffer = await fontRegResponse.arrayBuffer();

    const svg = await satori(
        {
            type: 'div',
            props: {
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#000000',
                    backgroundImage: 'radial-gradient(circle at 50% 50%, #111827, #000000)',
                    fontFamily: 'Roboto',
                    color: 'white',
                    padding: '80px',
                    border: '8px solid rgba(59, 130, 246, 0.4)',
                },
                children: [
                    {
                        type: 'div',
                        props: {
                            style: {
                                display: 'flex',
                                fontSize: 96,
                                fontWeight: 700,
                                letterSpacing: '-0.05em',
                                marginBottom: 20,
                                textAlign: 'center',
                                background: 'linear-gradient(to right, #ffffff, #9ca3af)',
                                backgroundClip: 'text',
                                color: 'transparent',
                            },
                            children: 'Panav Payappagoudar'
                        }
                    },
                    {
                        type: 'div',
                        props: {
                            style: {
                                display: 'flex',
                                fontSize: 42,
                                fontWeight: 400,
                                color: 'rgba(255,255,255,0.7)',
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                                marginBottom: 60,
                            },
                            children: 'Software Developer'
                        }
                    },
                    {
                        type: 'div',
                        props: {
                            style: {
                                display: 'flex',
                                gap: '30px',
                            },
                            children: [
                                'AI / ML',
                                'Cybersecurity',
                                'Web3'
                            ].map(skill => ({
                                type: 'div',
                                props: {
                                    style: {
                                        display: 'flex',
                                        fontSize: 28,
                                        fontWeight: 400,
                                        color: '#3b82f6',
                                        padding: '12px 32px',
                                        border: '2px solid rgba(59, 130, 246, 0.3)',
                                        borderRadius: '8px',
                                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                    },
                                    children: skill
                                }
                            }))
                        }
                    }
                ]
            }
        },
        {
            width: 1200,
            height: 630,
            fonts: [
                {
                    name: 'Roboto',
                    data: fontBuffer,
                    weight: 700,
                    style: 'normal',
                },
                {
                    name: 'Roboto',
                    data: fontRegBuffer,
                    weight: 400,
                    style: 'normal',
                }
            ],
        },
    );

    const resvg = new Resvg(svg, {
        background: '#000000',
        fitTo: {
            mode: 'width',
            value: 1200,
        },
    });

    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    const outPath = path.join(__dirname, '..', 'public', 'og-image.png');
    await fs.writeFile(outPath, pngBuffer);
    
    console.log(`[SUCCESS] OG Image generated at ${outPath}`);
}

generateOGImage().catch(console.error);
