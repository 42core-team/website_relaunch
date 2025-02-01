// import { GetStaticPaths, GetStaticProps } from 'next';
// import { Header } from '@/components/wiki/elements/Header';
// import { SubHeader } from '@/components/wiki/elements/SubHeader';
// import { InfoBox } from '@/components/wiki/elements/InfoBox';
// import { CodeBox } from '@/components/wiki/elements/CodeBox';
// import { AttentionBox } from '@/components/wiki/elements/AttentionBox';

// interface GettingStartedData {
//   title: string;
//   prerequisites: string[];
//   setupCode: string;
//   exampleCode: string;
// }

// const seasonData: Record<string, GettingStartedData> = {
//   'season-1': {
//     title: 'Getting Started with Season 1',
//     prerequisites: [
//       'Node.js 14 or higher',
//       'Basic JavaScript knowledge',
//       'Command line familiarity'
//     ],
//     setupCode: `npm install @core-game/client@1
// npm install @core-game/types@1`,
//     exampleCode: `import { CoreGame } from '@core-game/client';

// const game = new CoreGame({
//   apiKey: 'your-api-key',
//   season: '1'
// });

// game.onStart(() => {
//   // Your game logic here
//   console.log('Game started!');
// });

// game.connect();`
//   },
//   'season-2': {
//     title: 'Getting Started with Season 2',
//     prerequisites: [
//       'Node.js 16 or higher',
//       'Intermediate JavaScript knowledge',
//       'Understanding of Season 1 concepts'
//     ],
//     setupCode: `npm install @core-game/client@2
// npm install @core-game/types@2`,
//     exampleCode: `import { CoreGame, GameEvents } from '@core-game/client';

// const game = new CoreGame({
//   apiKey: 'your-api-key',
//   season: '2',
//   features: ['advanced-matching']
// });

// game.on(GameEvents.START, async (context) => {
//   // Your advanced game logic here
//   await context.initialize();
//   console.log('Game started with advanced features!');
// });

// game.connect();`
//   }
// };

// const GettingStartedPage = ({ version }: { version: string }) => {
//   const data = seasonData[version];

//   if (!data) return null;

//   return (
//     <WikiLayout>
//       <div className="max-w-4xl mx-auto">
//         <Header>{data.title}</Header>
        
//         <InfoBox title="Before You Begin">
//           Please ensure you have the following prerequisites:
//         </InfoBox>

//         <ul className="list-disc list-inside mb-6 text-default-600 space-y-2">
//           {data.prerequisites.map((prereq, index) => (
//             <li key={index}>{prereq}</li>
//           ))}
//         </ul>

//         <SubHeader>Installation</SubHeader>
//         <CodeBox
//           language="bash"
//           code={data.setupCode}
//         />

//         <SubHeader>Basic Example</SubHeader>
//         <p className="mb-4 text-default-600">
//           Here's a simple example to get you started:
//         </p>
        
//         <CodeBox
//           language="typescript"
//           code={data.exampleCode}
//         />

//         <AttentionBox title="API Key Required">
//           Remember to replace 'your-api-key' with your actual API key from the dashboard.
//         </AttentionBox>
//       </div>
//     </WikiLayout>
//   );
// };

// export const getStaticPaths: GetStaticPaths = async () => {
//   return {
//     paths: [
//       { params: { version: 'season-1' } },
//       { params: { version: 'season-2' } },
//     ],
//     fallback: false
//   };
// };

// export const getStaticProps: GetStaticProps = async ({ params }) => {
//   const version = params?.version as string;

//   if (!seasonData[version]) {
//     return {
//       notFound: true
//     };
//   }

//   return {
//     props: {
//       version
//     }
//   };
// };

// export default GettingStartedPage;