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
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#0e0f12',
                    fontFamily: 'Roboto',
                    color: '#f3efe6',
                    padding: '80px 90px',
                    border: '1px solid rgba(243, 239, 230, 0.12)',
                },
                children: [
                    {
                        type: 'div',
                        props: {
                            style: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                fontSize: 22,
                                fontWeight: 400,
                                color: '#c47847',
                                letterSpacing: '0.12em',
                                textTransform: 'uppercase',
                            },
                            children: 'Systems & Applied ML Researcher'
                        }
                    },
                    {
                        type: 'div',
                        props: {
                            style: {
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '16px',
                            },
                            children: [
                                {
                                    type: 'div',
                                    props: {
                                        style: {
                                            display: 'flex',
                                            fontSize: 78,
                                            fontWeight: 700,
                                            letterSpacing: '-0.03em',
                                            color: '#f3efe6',
                                            lineHeight: 1.05,
                                        },
                                        children: 'Panav Payappagoudar'
                                    }
                                },
                                {
                                    type: 'div',
                                    props: {
                                        style: {
                                            display: 'flex',
                                            fontSize: 32,
                                            fontWeight: 400,
                                            color: '#9e9a91',
                                            letterSpacing: '-0.01em',
                                        },
                                        children: 'VIT-AP University (ECS) · Amazon ML Scholar ’26'
                                    }
                                }
                            ]
                        }
                    },
                    {
                        type: 'div',
                        props: {
                            style: {
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                width: '100%',
                                paddingTop: '28px',
                                borderTop: '1px solid rgba(243, 239, 230, 0.08)',
                            },
                            children: [
                                {
                                    type: 'div',
                                    props: {
                                        style: {
                                            display: 'flex',
                                            gap: '16px',
                                        },
                                        children: [
                                            'Numerical Physics',
                                            'Satellite Vision',
                                            'Resilient Systems'
                                        ].map(skill => ({
                                            type: 'div',
                                            props: {
                                                style: {
                                                    display: 'flex',
                                                    fontSize: 20,
                                                    fontWeight: 400,
                                                    color: '#f3efe6',
                                                    padding: '10px 22px',
                                                    border: '1px solid rgba(243, 239, 230, 0.12)',
                                                    borderRadius: '6px',
                                                    backgroundColor: '#14151a',
                                                },
                                                children: skill
                                            }
                                        }))
                                    }
                                },
                                {
                                    type: 'div',
                                    props: {
                                        style: {
                                            display: 'flex',
                                            fontSize: 22,
                                            color: '#8e8a82',
                                            letterSpacing: '0.04em',
                                        },
                                        children: 'panav.xyz'
                                    }
                                }
                            ]
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
