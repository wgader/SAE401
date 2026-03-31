<?php
// check_limits.php - Diagnostic tool for MMI Server Upload Limits

echo "<h1>Configuration de l'Hébergement</h1>";

$limits = [
    'upload_max_filesize' => ini_get('upload_max_filesize'),
    'post_max_size'       => ini_get('post_max_size'),
    'memory_limit'        => ini_get('memory_limit'),
    'max_execution_time'  => ini_get('max_execution_time'),
];

echo "<table border='1' cellpadding='10'>";
echo "<tr><th>Paramètre</th><th>Valeur</th><th>Signification</th></tr>";
foreach ($limits as $key => $val) {
    $desc = match($key) {
        'upload_max_filesize' => 'Taille maximum autorisée pour UN SEUL fichier.',
        'post_max_size'       => 'Taille maximum autorisée pour TOUTE la requête (Textes + TOUS les médias).',
        'memory_limit'        => 'Mémoire RAM maximum allouée à PHP.',
        'max_execution_time'  => 'Temps d\'exécution maximum (en secondes) avant arrêt de PHP.',
        default => ''
    };
    echo "<tr><td><code>$key</code></td><td><strong>$val</strong></td><td>$desc</td></tr>";
}
echo "</table>";

echo "<p>💡 <em>Note : Si votre vidéo pèse plus que la valeur la plus basse entre <code>upload_max_filesize</code> et <code>post_max_size</code>, elle ne sera jamais publiée.</em></p>";

echo "<hr><p style='color:orange;'>⚠️ SUPPRIMEZ CE FICHIER APRES VERIFICATION !</p>";
