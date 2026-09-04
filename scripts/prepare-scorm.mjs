import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = join(process.cwd(), 'scorm-build');

function filesIn(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesIn(path) : [path];
  });
}

const contentFiles = filesIn(root);
for (const file of contentFiles.filter(path => /\.(?:html|css|js)$/.test(path))) {
  const content = readFileSync(file, 'utf8').replace(/(?<!\.)\/assets\//g, './assets/');
  writeFileSync(file, content);
}

const hrefs = filesIn(root)
  .map(path => relative(root, path).replaceAll('\\', '/'))
  .filter(path => path !== 'imsmanifest.xml')
  .sort();

const escapeXml = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const fileEntries = hrefs.map(href => `      <file href="${escapeXml(href)}"/>`).join('\n');
const manifest = `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="CLTE_WSH_WEEK_2026" version="1.0"
  xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
  xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
  </metadata>
  <organizations default="CLTE_WSH_ORG">
    <organization identifier="CLTE_WSH_ORG">
      <title>CLTE Workplace Safety Activity — WSH Week 2026</title>
      <item identifier="CLTE_WSH_ITEM" identifierref="CLTE_WSH_SCO" isvisible="true">
        <title>Workplace safety made practical</title>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="CLTE_WSH_SCO" type="webcontent" adlcp:scormtype="sco" href="index.html">
${fileEntries}
    </resource>
  </resources>
</manifest>
`;

writeFileSync(join(root, 'imsmanifest.xml'), manifest);
console.log(`Prepared SCORM 1.2 package content with ${hrefs.length} files.`);
