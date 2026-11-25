import fs from 'fs/promises';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateOGImage() {
    console.log('Generating OG Image...');

    const manropeBoldPath = path.join(__dirname, '..', 'node_modules', '@fontsource', 'manrope', 'files', 'manrope-latin-700-normal.woff');
    const interRegPath = path.join(__dirname, '..', 'node_modules', '@fontsource', 'inter', 'files', 'inter-latin-400-normal.woff');
    const interMedPath = path.join(__dirname, '..', 'node_modules', '@fontsource', 'inter', 'files', 'inter-latin-500-normal.woff');

    const [fontBoldBuffer, fontRegBuffer, fontMedBuffer] = await Promise.all([
        fs.readFile(manropeBoldPath),
        fs.readFile(interRegPath),
        fs.readFile(interMedPath),
    ]);

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
                    backgroundColor: '#F9F9F9',
                    fontFamily: 'Inter',
                    color: '#111111',
                    padding: '80px 90px',
                    border: '1px solid #E4E4E7',
                },
                children: [
                    {
                        type: 'div',
                        props: {
                            style: {
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '4px',
                            },
                            children: [
                                {
                                    type: 'div',
                                    props: {
                                        style: {
                                            display: 'flex',
                                            fontSize: 22,
                                            fontWeight: 500,
                                            color: '#111111',
                                        },
                                        children: 'Computer Science Undergraduate'
                                    }
                                },
                                {
                                    type: 'div',
                                    props: {
                                        style: {
                                            display: 'flex',
                                            fontSize: 20,
                                            fontWeight: 400,
                                            color: '#71717A',
                                        },
                                        children: 'VIT-AP University'
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
                                flexDirection: 'column',
                                gap: '18px',
                            },
                            children: [
                                {
                                    type: 'div',
                                    props: {
                                        style: {
                                            display: 'flex',
                                            fontFamily: 'Manrope',
                                            fontSize: 74,
                                            fontWeight: 700,
                                            letterSpacing: '-0.03em',
                                            color: '#111111',
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
                                            fontSize: 30,
                                            fontWeight: 400,
                                            color: '#52525B',
                                            letterSpacing: '-0.01em',
                                        },
                                        children: 'Applied Machine Learning · Distributed Systems · Embedded Robotics'
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
                                borderTop: '1px solid #E4E4E7',
                            },
                            children: [
                                {
                                    type: 'div',
                                    props: {
                                        style: {
                                            display: 'flex',
                                            gap: '14px',
                                        },
                                        children: [
                                            'Work',
                                            'Experience',
                                            'Achievements',
                                            'About'
                                        ].map(label => ({
                                            type: 'div',
                                            props: {
                                                style: {
                                                    display: 'flex',
                                                    fontSize: 18,
                                                    fontWeight: 500,
                                                    color: '#52525B',
                                                    marginRight: '18px',
                                                },
                                                children: label
                                            }
                                        }))
                                    }
                                },
                                {
                                    type: 'div',
                                    props: {
                                        style: {
                                            display: 'flex',
                                            fontFamily: 'Manrope',
                                            fontSize: 22,
                                            fontWeight: 700,
                                            color: '#111111',
                                            letterSpacing: '-0.02em',
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
                    name: 'Manrope',
                    data: fontBoldBuffer,
                    weight: 700,
                    style: 'normal',
                },
                {
                    name: 'Inter',
                    data: fontRegBuffer,
                    weight: 400,
                    style: 'normal',
                },
                {
                    name: 'Inter',
                    data: fontMedBuffer,
                    weight: 500,
                    style: 'normal',
                }
            ],
        },
    );

    const resvg = new Resvg(svg, {
        background: '#F9F9F9',
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
