diff --git a/src/services/personalizationEngine.ts b/src/services/personalizationEngine.ts
index d513ce96688b7e0611d23d72f7b0d2b9e06ba253..42b8c4b6db00e86ba51a73cd16c11ea17c2a49a0 100644
--- a/src/services/personalizationEngine.ts
+++ b/src/services/personalizationEngine.ts
@@ -196,166 +196,211 @@ export class PersonalizationService {
       // Retorna conteúdo padrão se não encontrar
       return this.getDefaultContent(trackType, dayNumber);
     }
     
     return data;
   }
 
   /**
    * Personaliza o conteúdo baseado no perfil
    */
   private static personalizeContent(
     baseContent: any,
     profile: UserProfile,
     dayNumber: number
   ): PersonalizedContent {
     const userNeeds = this.analyzeUserNeeds(profile);
     const difficulty = this.calculateDifficulty(dayNumber, profile);
     const activities = this.personalizeActivities(baseContent.activities || [], profile, userNeeds);
     
     return {
       dayNumber,
       title: this.personalizeText(baseContent.title || `Dia ${dayNumber}`, profile),
       subtitle: this.personalizeText(baseContent.subtitle || '', profile),
       description: this.personalizeText(baseContent.description || '', profile),
       activities,
-      mainFocus: this.determineMainFocus(dayNumber, userNeeds, profile.testResults.trackType),
+      mainFocus: this.determineMainFocus(
+        dayNumber,
+        userNeeds.primaryIssue,
+        profile.testResults.trackType
+      ),
       difficulty,
       estimatedTime: this.calculateEstimatedTime(activities),
       rewards: {
         points: this.calculatePoints(activities, difficulty),
         achievement: this.checkForAchievement(dayNumber, profile.testResults.trackType)
       }
     };
   }
 
   /**
    * Analisa necessidades do usuário
    */
   private static analyzeUserNeeds(profile: UserProfile) {
     const needs = {
-      primaryIssues: [] as string[],
+      primaryIssue: '' as string,
       strengthAreas: [] as string[],
       personalContext: {} as any
     };
 
     const scores = profile.testResults.categoryScores;
-    
-    // Identifica áreas problemáticas
-    if (scores.comportamento > 15) needs.primaryIssues.push('comportamento');
-    if (scores.vida_cotidiana > 15) needs.primaryIssues.push('produtividade');
-    if (scores.relacoes > 15) needs.primaryIssues.push('relacionamentos');
-    if (scores.espiritual > 15) needs.primaryIssues.push('espiritualidade');
-    
+
+    // Determina a categoria com maior pontuação
+    const entries = Object.entries(scores) as [keyof typeof scores, number][];
+    let maxCategory = entries[0][0];
+    for (const [category, value] of entries) {
+      if (value > scores[maxCategory]) {
+        maxCategory = category;
+      }
+    }
+    needs.primaryIssue = maxCategory;
+
     // Identifica pontos fortes
     if (scores.comportamento < 10) needs.strengthAreas.push('autocontrole');
     if (scores.vida_cotidiana < 10) needs.strengthAreas.push('gestao_tempo');
     if (scores.relacoes < 10) needs.strengthAreas.push('conexoes_humanas');
     if (scores.espiritual < 10) needs.strengthAreas.push('vida_espiritual');
-    
+
     return needs;
   }
 
   /**
    * Calcula dificuldade baseada no progresso
    */
   private static calculateDifficulty(
     dayNumber: number,
     profile: UserProfile
   ): 'easy' | 'medium' | 'hard' {
     const trackLength = this.getTrackLength(profile.testResults.trackType);
     const progress = dayNumber / trackLength;
     
     if (progress <= 0.3) return 'easy';
     if (progress <= 0.7) return 'medium';
     return 'hard';
   }
 
   /**
    * Personaliza atividades
    */
   private static personalizeActivities(
     baseActivities: any[],
     profile: UserProfile,
     userNeeds: any
   ): Activity[] {
-    return baseActivities.map((activity, index) => ({
+    const focusAreas = profile.preferences.focusAreas || [];
+    const totalScore = profile.testResults.totalScore;
+    const primaryIssue = userNeeds.primaryIssue as string;
+
+    const areaActivityMap: Record<string, string[]> = {
+      comportamento: ['challenge', 'exercise'],
+      vida_cotidiana: ['exercise', 'reflection'],
+      relacoes: ['reflection', 'challenge'],
+      espiritual: ['prayer', 'meditation'],
+      produtividade: ['exercise', 'challenge', 'reflection'],
+      relacionamentos: ['reflection', 'challenge'],
+      espiritualidade: ['prayer', 'meditation']
+    };
+
+    const targetAreas = new Set<string>([primaryIssue, ...focusAreas]);
+    const allowedTypes = new Set<string>();
+    targetAreas.forEach(area => {
+      const types = areaActivityMap[area];
+      if (types) types.forEach(t => allowedTypes.add(t));
+    });
+
+    const requiredActivities = baseActivities.filter(a => a.isRequired !== false);
+    let optionalActivities = baseActivities.filter(a => a.isRequired === false);
+
+    if (allowedTypes.size > 0) {
+      optionalActivities = optionalActivities.filter(a => allowedTypes.has(a.type));
+    }
+
+    const maxOptional = Math.min(
+      optionalActivities.length,
+      Math.floor(totalScore / 50)
+    );
+    optionalActivities = optionalActivities.slice(0, maxOptional);
+
+    const selected = [...requiredActivities, ...optionalActivities];
+
+    return selected.map((activity, index) => ({
       id: `activity-${profile.testResults.trackType}-day${profile.progressData.currentDay}-${index}`,
       type: activity.type || 'exercise',
       title: this.personalizeText(activity.title || 'Atividade', profile),
       description: activity.description || '',
       duration: activity.duration || 15,
       contentUrl: activity.contentUrl,
       instructions: activity.instructions || [],
       difficulty: activity.baseDifficulty || 1,
       points: activity.points || 10,
       isRequired: activity.isRequired !== false,
       completed: false
     }));
   }
 
   /**
    * Personaliza texto substituindo variáveis
    */
   private static personalizeText(text: string, profile: UserProfile): string {
     if (!text) return '';
     
     const replacements: { [key: string]: string } = {
       '{{user_name}}': 'amigo',
       '{{track_name}}': this.getTrackName(profile.testResults.trackType),
       '{{total_score}}': profile.testResults.totalScore.toString(),
       '{{current_day}}': profile.progressData.currentDay.toString(),
       '{{streak}}': profile.progressData.streak.toString()
     };
     
     let result = text;
     for (const [key, value] of Object.entries(replacements)) {
       result = result.replace(new RegExp(key, 'g'), value);
     }
     
     return result;
   }
 
   /**
    * Determina o foco principal do dia
    */
   private static determineMainFocus(
     dayNumber: number,
-    userNeeds: any,
+    primaryIssue: string,
     trackType: string
   ): string {
     const trackLength = this.getTrackLength(trackType);
     const phase = Math.ceil((dayNumber / trackLength) * 4);
-    
+
     const focusMap: { [key: number]: string } = {
       1: 'Conscientização e Reconhecimento',
       2: 'Ação e Mudança',
       3: 'Integração e Hábito',
       4: 'Maestria e Manutenção'
     };
-    
-    return focusMap[phase] || 'Desenvolvimento Contínuo';
+
+    const baseFocus = focusMap[phase] || 'Desenvolvimento Contínuo';
+    return primaryIssue ? `${baseFocus} - foco em ${primaryIssue}` : baseFocus;
   }
 
   /**
    * Calcula tempo estimado
    */
   private static calculateEstimatedTime(activities: Activity[]): number {
     return activities.reduce((total, activity) => {
       return total + (activity.isRequired ? activity.duration : 0);
     }, 0);
   }
 
   /**
    * Calcula pontos totais
    */
   private static calculatePoints(
     activities: Activity[],
     difficulty: string
   ): number {
     const multiplier = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 1.5 : 2;
     return Math.round(
       activities.reduce((total, activity) => total + activity.points, 0) * multiplier
     );
   }
 
   /**
