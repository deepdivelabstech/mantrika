# Google Play store listing (ASO)

Copy for Play Console → Grow → Store presence → Main store listing. Every claim
here matches a shipped feature; keep it that way when editing (Play rejects
misleading descriptions, and false claims hurt ratings).

Play has no keyword field. It ranks on the **title**, **short description** and
**full description**, with the title weighted most. Repeat each target keyword
2–4 times in the full description, written naturally. Repeating more than that
reads as keyword stuffing, which Play penalises.

## Target keywords

| Priority | Keywords                                                                                   |
| -------- | ------------------------------------------------------------------------------------------ |
| Primary  | japa counter, mala counter, mantra counter, jaap counter, naam jap                         |
| Category | japa mala, 108 beads, chanting app, mantra jaap, digital mala, tasbih-style counter        |
| Mantras  | Om Namah Shivaya, Gayatri Mantra, Hare Krishna, Maha Mrityunjaya, Hanuman, Ram naam, Radhe |
| Intent   | daily sadhana, meditation, sankalpa, anushthan, streak, reminder                           |
| Hindi    | माला जाप, मंत्र जाप, जप माला, नाम जप                                                       |

Check these against Play Console → Store performance → search terms after
4–6 weeks and swap out terms that bring no installs.

## Title (max 30 chars)

```
Mantrika: Japa Mala Counter
```

(27 chars. Alternative: `Mantrika – Mantra Jaap Counter`, 30 chars.)

## Short description (max 80 chars)

```
108-bead japa mala & mantra counter with streaks, reminders and daily goals
```

(75 chars.)

## Full description (max 4000 chars)

```
Mantrika is a calm, beautiful japa mala counter for your daily mantra practice. Tap one bead at a time on a 108-bead digital mala, and Mantrika keeps count for you, round after round, so you can keep your mind on the mantra and not on the numbers.

Whether you chant Om Namah Shivaya, the Gayatri Mantra, the Hare Krishna Maha Mantra or Ram naam, Mantrika turns japa into a steady daily sadhana.

📿 A TRUE 108-BEAD MALA COUNTER
• Tap anywhere to count. Each bead moves along the mala and a full round of 108 is marked with a temple bell and a gentle vibration
• Undo the last bead if you tap by mistake
• Optional pause after each round so you don't run on into the next mala
• Haptic feedback that feels like moving real mala beads

🙏 35+ MANTRAS IN HINDI AND ENGLISH
Om Namah Shivaya, Maha Mrityunjaya Mantra, Gayatri Mantra, Hare Krishna Maha Mantra, Om Gam Ganapataye Namaha, Om Namo Bhagavate Vasudevaya, Sri Rama Jaya Rama, Sita Ram, Radhe Radhe, Om Shri Hanumate Namah, Om Aim Saraswatyai Namah, Om Dum Durgayei Namaha, Om Shri Mahalakshmyai Namah, Navarna Mantra, Om Sai Ram, Om Mani Padme Hum, Waheguru, So Hum and more. Each mantra is shown in Devanagari and in English.
• Add your own custom mantra for naam jap of your Ishta Devata or Guru mantra
• Search and filter the mantra library

👁 EYES-CLOSED FOCUS MODE
Chant with your eyes closed. The whole screen becomes the mala: tap anywhere, the screen stays awake and dimmed, and nothing distracts you from your jaap.

🎯 DAILY GOALS AND SANKALPA
• Set a daily goal from 1 to 21 malas
• Take a sankalpa (anushthan): chant one mantra a set number of times within a set number of days, for example 1.25 lakh Gayatri japa in 40 days, and track it every day

🔥 STREAKS AND PROGRESS
• Daily practice streak and best streak
• Practice calendar heatmap and weekly chart
• Lifetime total per mantra: see how many times you have chanted Om Namah Shivaya across all your sessions

🔔 GENTLE REMINDERS
A daily sadhana reminder at the time you choose, so your mantra practice becomes a habit.

🌿 MEDITATIVE SOUNDSCAPES
Chant to the sound of the Ganga river, an evening forest or Tibetan singing bowls, or in silence.

🔒 PRIVATE BY DESIGN
No account, no sign-up. Your japa counts stay on your phone. Export a backup any time and restore it on a new phone.

Mantrika is made for anyone who does japa: daily mantra jaap, naam jap, Hanuman Chalisa sadhana, meditation with a mala, or a 40-day anushthan. Download Mantrika, the japa mala counter, and begin today's mala.

Om Shanti 🙏
```

(About 2,400 chars, leaving room to add new features as they ship.)

Before publishing, check two claims against the build you're shipping:
"35+ mantras" (the bundled catalog has 35) and the daily goal values (set in
`DAILY_GOAL_OPTIONS` in `src/shared/types/models.ts`).

## Hindi listing (hi-IN)

Add a Hindi translation in Play Console → Manage translations. Write it from
the copy above (don't rely on Play's machine translation) and use
माला जाप / मंत्र जाप / जप माला / नाम जप in the Hindi title and short description.
Many Indian users search in Devanagari, and English-only listings miss them.

## Iterating

- Change one element at a time (title, short description, icon or first
  screenshot) using Play Console → Store listing experiments, so you can tell
  which change moved installs.
- Before festivals (Navratri, Maha Shivratri, Shravan, Janmashtami,
  Hanuman Jayanti), add a line naming the festival and its mantra near the top
  of the full description, and remove it afterwards.
- Screenshot captions count for conversion, not ranking. Lead with the mala
  counter, then mantras, then focus mode, then streaks.
